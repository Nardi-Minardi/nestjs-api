import { HttpException, Inject, Injectable } from '@nestjs/common';
import { LoginRequestDto, LoginResponseDto } from './dto/login.dto';
import { RegisterRequestDto, RegisterResponseDto } from './dto/register.dto';
import { ValidationService } from 'src/common/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AuthValidation } from './auth.validation';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/user/user.repository';
import { User } from '@prisma/client';

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
        409,
      );
    }

    // Create user
    const user = await this.userRepository.createUser({
      email: registerRequest.email,
      username: registerRequest.username,
      password_hash: await bcrypt.hash(registerRequest.password, 10),
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
      throw new HttpException('Email, username, or password is wrong', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(
      loginRequest.password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new HttpException('Email, username, or password is wrong', 401);
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    // Create token
    const token = await this.generateToken(user);

    return {
      email: user.email,
      username: user.username,
      role: user.role,
      fullname: user.fullname,
      token: token,
    };
  }

  private async generateToken(user: User) {
    return this.jwtService.signAsync({ sub: user.id, role: user.role });
  }
}
