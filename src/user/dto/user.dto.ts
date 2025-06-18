export class UserDto {
  id: string;
  email: string;
  username: string;
  role: string;
  fullname: string | null;
  avatar: string | null;
  password_hash?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
}
