import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterResponseDto } from './dto/register.dto';
import { LoginResponseDto } from './dto/login.dto';
import { WebResponse } from 'src/common/web-response';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('/api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  @HttpCode(201)
  @Roles(Role.ADMIN)
  async register(@Body() request): Promise<WebResponse<RegisterResponseDto>> {
    const result = await this.authService.register(request);
    return {
      message: 'Register success',
      data: result,
    };
  }

  @Public()
  @Post('/login')
  @HttpCode(200)
  async login(@Body() request): Promise<WebResponse<LoginResponseDto>> {
    const result = await this.authService.login(request);
    return {
      message: 'Login success',
      data: result,
    };
  }
}
