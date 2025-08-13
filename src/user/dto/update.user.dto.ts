import { UserDto } from './user.dto';

export class UpdateUserRequestDto {
  userId: string;
  email?: string;
  username?: string;
  role?: string;
  fullname?: string | null;
  password?: string;
  confirmPassword?: string;
  avatar?: string | null;
  firstName: string;
  lastName: string;
}

export class UpdateUserResponseDto extends UserDto {}

export class UpdateUserAvatarRequestDto {
  userId: string;
  path: string;
}

export class UpdateUserAvatarResponseDto {
  path: string;
}