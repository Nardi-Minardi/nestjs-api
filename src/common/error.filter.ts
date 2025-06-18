import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Inject,
} from '@nestjs/common';
import { ZodError } from 'zod';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Catch(ZodError, HttpException)
export class ErrorFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      this.logger.error('Error', { error: exception.getResponse() });
      response.status(exception.getStatus()).json({
        message: exception.getResponse(),
      });
    } else if (exception instanceof ZodError) {
      this.logger.error('Error', { error: exception.issues[0].message });
      response.status(400).json({
        errors: exception.issues[0].message,
        message: 'Validation error',
      });
    } else {
      this.logger.error('Error', { error: exception.message });
      response.status(500).json({
        message: exception.message,
      });
    }
  }
}
