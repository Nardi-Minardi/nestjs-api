export class LoginRequestDto {
  email: string;
  password: string;
}

export class LoginResponseDto {
  email: string;
  username: string;
  role: string;
  fullname: string | null;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: string;
}


export class RefreshTokenRequestDto {
  refreshToken: string;
}

export class RefreshTokenResponseDto {
  accessToken: string;
  expiresAt: string;
}

