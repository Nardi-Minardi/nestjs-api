import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new HttpException('Forbidden', 403);
    }

    const hasRequiredRole = requiredRoles.some((role) =>
      (Array.isArray(user.role) ? user.role : [user.role]).includes(role),
    );

    if (hasRequiredRole) {
      return true;
    }

    throw new HttpException('Forbidden', 403);
  }
}
