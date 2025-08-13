import { HttpException, Inject, Injectable, Req } from '@nestjs/common';
import {
  LoginRequestDto,
  LoginResponseDto,
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
} from './dto/login.dto';
import { RegisterRequestDto, RegisterResponseDto } from './dto/register.dto';
import { ValidationService } from 'src/common/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AuthValidation } from './auth.validation';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/user/user.repository';
import { User } from '@prisma/client';
import * as crypto from 'crypto';
import ms from 'ms';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// Set default timezone Asia/Jakarta
dayjs.tz.setDefault('Asia/Jakarta');

@Injectable()
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private validationService: ValidationService,
    private jwtService: JwtService,
    private userRepository: UserRepository,
  ) {}

  async register(request: RegisterRequestDto): Promise<RegisterResponseDto> {
    this.logger.debug('Registering new user', { request });
    const registerRequest: RegisterRequestDto = this.validationService.validate(
      AuthValidation.REGISTER,
      request,
    );

    // Check password
    if (registerRequest.password != registerRequest.confirmPassword) {
      throw new HttpException('Passwords do not match', 400);
    }

    // Check email and username exists
    const userCount = await this.userRepository.countByEmailOrUsername(
      registerRequest.email,
      registerRequest.username,
    );
    if (userCount != 0) {
      this.logger.error(
        `User with email ${registerRequest.email} or username ${registerRequest.username} already exists`,
      );
      throw new HttpException(
        'User with that email or username already exists',
        400,
      );
    }

    // Create user
    const user = await this.userRepository.createUser({
      email: registerRequest.email,
      username: registerRequest.username,
      password_hash: await bcrypt.hash(registerRequest.password, 10),
      fullname: registerRequest.firstName + ' ' + registerRequest.lastName,
    });

    return {
      email: user.email,
      username: user.username,
      role: user.role,
      fullname: user.fullname,
    };
  }

  async login(request: LoginRequestDto): Promise<LoginResponseDto> {
    this.logger.debug('Logging in user', { request });
    const loginRequest: LoginRequestDto = this.validationService.validate(
      AuthValidation.LOGIN,
      request,
    );

    // Check user exists
    const user = await this.userRepository.findByEmailOrUsername(
      loginRequest.email,
    );
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(
      loginRequest.password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', 401);
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    // Create token
    const token = await this.generateToken(user);

    const expiresAtString = await this.generateExpiredToken();

    // create refresh token
    const refreshToken = await this.generateRefreshToken(user);

    return {
      email: user.email,
      username: user.username,
      role: user.role,
      fullname: user.fullname,
      accessToken: token,
      refreshToken: refreshToken,
      expiresAt: expiresAtString,
    };
  }

  //refresh token (pastikan ke FE untuk mengirimkan refresh token sebelum access token expired)
  async refreshToken(
    req: Request,
    body: RefreshTokenRequestDto,
  ): Promise<RefreshTokenResponseDto> {
    this.logger.debug('Refreshing token', { body });

    // Ambil JWT access token dari Authorization header
    const bearerToken = (req.headers as any).authorization;
    if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
      throw new HttpException('Access token not provided', 401);
    }
    const accessToken = bearerToken.split(' ')[1];

    // Decode JWT untuk dapatkan payload user
    let payload: any;
    try {
      payload = this.jwtService.verify(accessToken, {
        ignoreExpiration: true, // boleh ignore expired saat refresh
      });
    } catch (err) {
      throw new HttpException('Invalid access token', 401);
    }

    // Validasi refresh token dari body
    const expectedToken = crypto
      .createHash('sha256')
      .update(process.env.JWT_SECRET_REFRESH + payload.sub)
      .digest('hex');

    if (body.refreshToken !== expectedToken) {
      throw new HttpException('Invalid refresh token', 401);
    }

    const expiresAtString = await this.generateExpiredToken();

    // Generate access token baru
    const newToken = await this.generateToken({
      id: payload.sub,
      role: payload.role,
    } as User);

    return { accessToken: newToken , expiresAt: expiresAtString };
  }

  private async generateToken(user: User) {
    return this.jwtService.signAsync(
      { sub: user.id, role: user.role, tokenType: 'access' },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.DURATION_ACCESS_TOKEN,
      },
    );
  }

  private async generateRefreshToken(user: User) {
    const refreshSecretKey = process.env.JWT_SECRET_REFRESH;
    if (!refreshSecretKey) {
      throw new HttpException('Refresh secret key is not set', 500);
    }
    //pakai user id untuk membedakan refresh token antar user
    return crypto
      .createHash('sha256')
      .update(refreshSecretKey + user.id)
      .digest('hex');
  }

  private async generateExpiredToken() {
    const expiresAtString = dayjs()
      .tz('Asia/Jakarta')
      .add(ms(process.env.DURATION_ACCESS_TOKEN), 'milliseconds')
      .format('YYYY-MM-DD HH:mm:ss');
    return expiresAtString;
  }
}
