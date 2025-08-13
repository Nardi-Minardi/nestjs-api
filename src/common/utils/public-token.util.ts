import * as crypto from 'crypto';
import { Request } from 'express';

export function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket.remoteAddress ||
    ''
  );
}

export function generatePublicToken(ip: string): string {
  const secretKey = process.env.PUBLIC_SECRET_KEY;
  return crypto
    .createHash('sha256')
    .update(ip + secretKey)
    .digest('hex');
}
