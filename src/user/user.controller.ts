import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PublicByHeaderToken } from 'src/common/decorators/public-by-header-token.decorator';
import {
  UpdateUserAvatarResponseDto,
  UpdateUserResponseDto,
} from './dto/update.user.dto';
import { Pagination, WebResponse } from 'src/common/web.response';
import { GetUserResponseDto } from './dto/get.user.dto';
import { Role } from 'src/common/enums/role.enum';
import { UserDto } from './dto/user.dto';
import { User } from 'src/common/decorators/user.decorator';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/multer.config';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  @HttpCode(200)
  @Public()
  @PublicByHeaderToken()
  async getAllUsers(
    @Query('search') search: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('orderBy') orderBy: string,
    @Query('orderDirection') orderDirection: 'asc' | 'desc' = 'desc',
    @Query('filters') filters: string, // ubah jadi string
  ): Promise<WebResponse<UserDto[], Pagination>> {
    let parsedFilters: Array<{ field: string; value: string }> = [];
    if (filters) {
      try {
        parsedFilters = JSON.parse(filters);
      } catch (e) {
        console.warn('Invalid filters JSON:', filters);
      }
    }

    const result = await this.userService.getAllUsers({
      search,
      page,
      limit,
      orderBy,
      orderDirection,
      filters: parsedFilters,
    });
    return {
      statusCode: 200,
      message: 'Success',
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get('/:id')
  @HttpCode(200)
  @Public()
  @PublicByHeaderToken()
  async getUser(
    @Param('id') userId: string,
  ): Promise<WebResponse<GetUserResponseDto>> {
    const result = await this.userService.getUserById({ userId });
    return { statusCode: 200, message: 'Success', data: result };
  }

  @Put('/:id')
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
    return { statusCode: 200, message: 'Success', data: result };
  }

  @Post('/avatar')
  @HttpCode(201)
  @Roles(Role.ADMIN, Role.USER)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async updateUserAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Body() request: { userId: string },
  ): Promise<WebResponse<UpdateUserAvatarResponseDto>> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    if (!request.userId) {
      throw new BadRequestException('User ID wajib diisi');
    }

    const result = await this.userService.updateUserAvatar(file, {
      userId: request.userId,
      path: file.path,
    });

    return { statusCode: 201, message: 'Success', data: result };
  }
}
