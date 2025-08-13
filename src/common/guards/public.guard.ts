import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { PUBLIC_BY_HEADER_TOKEN } from '../decorators/public-by-header-token.decorator';
import * as crypto from 'crypto';

@Injectable()
export class PublicByHeaderTokenGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublicByHeaderToken = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_BY_HEADER_TOKEN,
      [context.getHandler(), context.getClass()],
    );

    if (!isPublicByHeaderToken) {
      return true; // bukan endpoint public token
    }

    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = this.getClientIp(request);
    const token = request.headers['x-public-token'];

    if (!token) {
      throw new UnauthorizedException('Missing x-public-token header');
    }

    const secretKey = process.env.PUBLIC_SECRET_KEY;

    // Hash IP + secret
    const expectedToken = crypto
      .createHash('sha256')
      .update(clientIp + secretKey)
      .digest('hex');

    if (token !== expectedToken) {
      throw new UnauthorizedException('Invalid public token');
    }

    return true;
  }

  private getClientIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      ''
    );
  }
}
