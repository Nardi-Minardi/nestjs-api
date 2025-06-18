export class RegisterRequestDto {
  email: string;
  username: string;
  fullname?: string;
  password: string;
  confirmPassword: string;
}

export class RegisterResponseDto {
  email: string;
  username: string;
  role: string;
  fullname: string | null;
}
