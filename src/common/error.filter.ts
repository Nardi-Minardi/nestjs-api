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
      const res = exception.getResponse();
      this.logger.error('Error', { error: res });

      // Kalau response sudah object (misal WebResponse), kirim langsung
      if (typeof res === 'object' && res !== null) {
        response.status(exception.getStatus()).json(res);
      } else {
        // Kalau string, bungkus manual
        response.status(exception.getStatus()).json({
          statusCode: exception.getStatus(),
          message: res,
        });
      }
    }

    else if (exception instanceof ZodError) {
      const formattedErrors = exception.errors.map(e => ({
        field: e.path.join('.') || 'value',
        message: e.message,
      }));

      this.logger.error('Error', { error: formattedErrors });

      response.status(422).json({
        statusCode: 422,
        errors: formattedErrors,
      });
    }

    else {
      this.logger.error('Error', { error: exception.message });
      response.status(500).json({
        statusCode: 500,
        message: exception.message,
      });
    }
  }
}
