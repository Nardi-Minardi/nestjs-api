import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        // TODO: Development only
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        /^http:\/\/192\.168\.1\.\d{1,3}:3000$/,
        /^http:\/\/192\.168\.72\.\d{1,3}:3000$/,
      ];

      if (
        !origin ||
        allowedOrigins.some((o) =>
          typeof o === 'string' ? o === origin : o.test(origin),
        )
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.sendStatus(204); // No Content
    } else {
      next();
    }
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
