import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { RedisService } from './redis.service';
import { ValidationService } from './validation.service';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ErrorFilter } from './error.filter';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtModule } from '@nestjs/jwt';
import { PublicByHeaderTokenGuard } from './guards/public.guard';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/app.log',
          level: process.env.LOG_LEVEL || 'info',
          maxsize: 5 * 1024 * 1024, // 5MB
          maxFiles: 5,
          tailable: true,
        }),
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.DURATION_ACCESS_TOKEN },
    }),
  ],
  providers: [
    PrismaService,
    ValidationService,
    // RedisService,
    { provide: APP_FILTER, useClass: ErrorFilter },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PublicByHeaderTokenGuard },
  ],
  exports: [PrismaService, ValidationService],
})
export class CommonModule {}
