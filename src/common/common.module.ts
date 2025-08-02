import { Global, Module } from '@nestjs/common';
// import { ServeStaticModule } from '@nestjs/serve-static';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { ValidationService } from './validation.service';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ErrorFilter } from './error.filter';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
// import * as path from 'path';
import { JwtModule } from '@nestjs/jwt';
import { S3Service } from './s3.service';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.json(),
      transports: [new winston.transports.Console()],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // TODO: turn this on if want to upload locally
    // ServeStaticModule.forRoot({
    //   serveRoot: '/uploads',
    //   rootPath: path.join(process.cwd(), 'uploads'),
    // }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [
    PrismaService,
    ValidationService,
    { provide: APP_FILTER, useClass: ErrorFilter },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    S3Service,
  ],
  exports: [PrismaService, ValidationService, S3Service],
})
export class CommonModule {}
