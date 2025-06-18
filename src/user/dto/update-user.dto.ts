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
}

export class UpdateUserResponseDto extends UserDto {}

export class UpdateUserAvatarRequestDto {
  userId: string;
}

export class UpdateUserAvatarResponseDto extends UserDto {}
