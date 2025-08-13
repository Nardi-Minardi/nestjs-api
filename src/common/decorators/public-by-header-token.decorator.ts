import { SetMetadata } from '@nestjs/common';

export const PUBLIC_BY_HEADER_TOKEN = 'publicByHeaderToken';
export const PublicByHeaderToken = () => SetMetadata(PUBLIC_BY_HEADER_TOKEN, true);