export class LoginRequestDto {
  email: string;
  password: string;
}

export class LoginResponseDto {
  email: string;
  username: string;
  role: string;
  fullname: string | null;
  token: string;
}
