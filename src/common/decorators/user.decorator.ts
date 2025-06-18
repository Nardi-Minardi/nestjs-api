import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthDto } from 'src/auth/dto/auth.dto';

interface RequestUser extends Request {
  user: AuthDto;
}

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestUser>();
    return request.user;
  },
);
