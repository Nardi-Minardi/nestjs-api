import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import {
  UpdateUserAvatarRequestDto,
  UpdateUserAvatarResponseDto,
  UpdateUserRequestDto,
  UpdateUserResponseDto,
} from './dto/update.user.dto';
import * as bcrypt from 'bcrypt';
import { UserValidation } from './user.validation';
import { User } from '@prisma/client';
import {
  GetUserRequestDto,
  GetUserRequestPaginationDto,
  GetUserResponseDto,
  GetUserResponsePaginationDto,
} from './dto/get.user.dto';
import { UserRepository } from './user.repository';
import { Role } from 'src/common/enums/role.enum';
import * as path from 'path';
import * as fs from 'fs/promises';
import { normalizedPath } from 'src/common/utils/normalized-path.util';

@Injectable()
export class UserService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private validationService: ValidationService,
    private userRepository: UserRepository,
  ) {}

  async getAllUsers(
    request: GetUserRequestPaginationDto,
  ): Promise<GetUserResponsePaginationDto> {
    this.logger.debug('Fetching all users', { request });
    const getRequest = this.validationService.validate(
      UserValidation.GET_USER_PAGINATION,
      request,
    );

    // Get user
    const users = await this.userRepository.findAllWithPagination(
      getRequest.search,
      getRequest.page,
      getRequest.limit,
      getRequest.orderBy,
      getRequest.orderDirection,
      getRequest.filters,
    );

    // Get user count
    const userCount = await this.userRepository.countSearch(getRequest.search);

    const pagination = {
      currentPage: getRequest.page,
      totalPage: Math.ceil(userCount / getRequest.limit),
      totalData: userCount,
    };

    return {
      data: users.map((user) => {
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          fullname: user.fullname,
          avatar: normalizedPath(user.avatar ?? ''),
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          lastLogin: user.last_login,
        };
      }),
      pagination,
    };
  }

  async getUserById(request: GetUserRequestDto): Promise<GetUserResponseDto> {
    this.logger.debug('Fetching user by Id', request);
    const getRequest: GetUserRequestDto = this.validationService.validate(
      UserValidation.USER_ID,
      request,
    );

    // Get user
    const user = await this.userRepository.findById(getRequest.userId);
    if (!user) {
      this.logger.error(`User with Id ${getRequest.userId} not found`);
      throw new HttpException('User not found', 404);
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      fullname: user.fullname,
      avatar: normalizedPath(user.avatar ?? ''),
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLogin: user.last_login,
    };
  }

  async updateUserById(
    request: UpdateUserRequestDto,
  ): Promise<UpdateUserResponseDto> {
    this.logger.debug('Updating user by Id', request);
    const updateRequest: UpdateUserRequestDto = this.validationService.validate(
      UserValidation.UPDATE_USER,
      request,
    );

    // Check user
    const userCount = await this.userRepository.countById(updateRequest.userId);
    if (userCount == 0) {
      this.logger.error(`User with Id ${updateRequest.userId} not found`);
      throw new HttpException('User not found', 404);
    }

    const data: Partial<User> = {};
    if (updateRequest.email) {
      const emailCheck = await this.userRepository.countByEmail(
        updateRequest.userId,
        updateRequest.email,
      );
      if (emailCheck > 0) {
        this.logger.error(
          `User with Email ${updateRequest.email} already exists`,
        );
        throw new HttpException('User with that email already exists', 404);
      }
      data.email = updateRequest.email;
    }

    if (updateRequest.username) {
      const usernameCheck = await this.userRepository.countByUsername(
        updateRequest.userId,
        updateRequest.username,
      );
      if (usernameCheck > 0) {
        this.logger.error(
          `User with Username ${updateRequest.username} already exists`,
        );
        throw new HttpException('User with that username already exists', 404);
      }
      data.username = updateRequest.username;
    }

    if (updateRequest.password) {
      if (updateRequest.password != updateRequest.confirmPassword) {
        throw new HttpException('Password do not match', 400);
      }
      data.password_hash = await bcrypt.hash(updateRequest.password, 10);
    }

    if (updateRequest.role) {
      if (this.isValidRole(updateRequest.role)) {
        data.role = updateRequest.role;
      } else {
        throw new HttpException('Role not exists', 400);
      }
    }

    if (updateRequest.firstName || updateRequest.lastName) {
      data.fullname = updateRequest.firstName + updateRequest.lastName
    }

    const updatedUser = await this.userRepository.updateById(
      updateRequest.userId,
      data,
    );

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      role: updatedUser.role,
      fullname: updatedUser.fullname,
      avatar: updatedUser.avatar,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at,
      lastLogin: updatedUser.last_login,
    };
  }

  async updateUserAvatar(
    file: Express.Multer.File,
    request: UpdateUserAvatarRequestDto,
  ): Promise<UpdateUserAvatarResponseDto> {
    this.logger.debug('Updating user avatar', { file, userId: request.userId });
    const updateRequest: UpdateUserAvatarRequestDto =
      this.validationService.validate(UserValidation.AVATAR, request);

    // Check user
    const user = await this.userRepository.findById(updateRequest.userId);
    if (!user) {
      this.logger.error(`User with Id ${updateRequest.userId} not found`);
      throw new HttpException('User not found', 404);
    }

    // Delete previous avatar if exists
    if (user.avatar !== null) {
      const filePath = path.join(process.cwd(), user.avatar);
      console.log('Deleting previous avatar:', filePath);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        if (error.code === 'ENOENT') {
          throw new HttpException('Previous avatar not found', 404);
        }
        throw error;
      }
    }

    const updatedUser = await this.userRepository.updateById(
      updateRequest.userId,
      { avatar: file.path },
    );

    return {
      path: normalizedPath(updatedUser.avatar ?? ''),
    };
  }

  private isValidRole(value: string): value is Role {
    return Object.values(Role).includes(value as Role);
  }
}
