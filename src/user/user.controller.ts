import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  UpdateUserAvatarResponseDto,
  UpdateUserResponseDto,
} from './dto/update-user.dto';
import { Pagination, WebResponse } from 'src/common/web-response';
import { GetUserResponseDto } from './dto/get-user.dto';
import { Role } from 'src/common/enums/role.enum';
import { UserDto } from './dto/user.dto';
import { User } from 'src/common/decorators/user.decorator';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/multer.config';

@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  @HttpCode(200)
  @Roles(Role.ADMIN)
  async getAllUsers(
    @Query('search') search: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ): Promise<WebResponse<UserDto[], Pagination>> {
    const result = await this.userService.getAllUsers({
      search,
      page,
      limit,
    });
    return {
      message: 'Success',
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get('/:id')
  @HttpCode(200)
  @Roles(Role.ADMIN)
  async getUser(
    @Param('id') userId: string,
  ): Promise<WebResponse<GetUserResponseDto>> {
    const result = await this.userService.getUserById({ userId });
    return { message: 'Success', data: result };
  }

  @Patch('/:id')
  @HttpCode(200)
  @Roles(Role.ADMIN)
  async updateUser(
    @Param('id') id: string,
    @Body() request,
  ): Promise<WebResponse<UpdateUserResponseDto>> {
    const result = await this.userService.updateUserById({
      userId: id,
      ...request,
    });
    return { message: 'Success', data: result };
  }

  @Put('/avatar')
  @HttpCode(200)
  @Roles(Role.ADMIN, Role.USER)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async updateUserAvatar(
    @UploadedFile('file') file: Express.Multer.File,
    @User() user: AuthDto,
  ): Promise<WebResponse<UpdateUserAvatarResponseDto>> {
    const result = await this.userService.updateUserAvatar(file, {
      userId: user.sub,
    });
    return { message: 'Success', data: result };
  }
}
