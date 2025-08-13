import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterResponseDto } from './dto/register.dto';
import { LoginResponseDto } from './dto/login.dto';
import { WebResponse } from 'src/common/web.response';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import {
  generatePublicToken,
  getClientIp,
} from 'src/common/utils/public-token.util';

@Controller('/api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/register')
  @HttpCode(200)
  async register(
    @Body() request: any,
  ): Promise<WebResponse<RegisterResponseDto>> {
    const result = await this.authService.register(request);
    return {
      statusCode: 200,
      message: 'Register success',
      data: result,
    };
  }

  @Public()
  @Get('/public-token')
  @HttpCode(200)
  async getPublicToken(
    @Req() request,
  ): Promise<WebResponse<{ ip: string; token: string }>> {
    const ip = getClientIp(request);
    const token = generatePublicToken(ip);

    return {
      statusCode: 200,
      message: 'Public token generated',
      data: { ip, token },
    };
  }

  @Public()
  @Post('/login')
  @HttpCode(200)
  async login(@Body() request: any): Promise<WebResponse<LoginResponseDto>> {
    const result = await this.authService.login(request);
    return {
      statusCode: 200,
      message: 'Login success',
      data: result,
    };
  }

  //refresh token
  @Post('/refresh-token')
  @HttpCode(200)
  async refreshToken(
    @Req() req: Request,
    @Body() request: any,
  ): Promise<WebResponse<{ accessToken: string }>> {
    const result = await this.authService.refreshToken(req, request);
    return {
      statusCode: 200,
      message: 'Refresh token success',
      data: result,
    };
  }
}
