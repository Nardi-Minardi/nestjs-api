import {
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  onModuleInit() {
    this.client = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
    });

    this.client.on('connect', () => {
      this.logger.info('[Redis] Connected to server');
    });

    this.client.on('ready', () => {
      this.logger.info('[Redis] Ready to use');
    });

    this.client.on('error', (err) => {
      this.logger.error(`[Redis] Connection error: ${err.message}`);
    });

    this.client.on('close', () => {
      this.logger.warn('[Redis] Connection closed');
    });

    this.client.on('reconnecting', () => {
      this.logger.warn('[Redis] Reconnecting...');
    });
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
      this.logger.info(`[Redis] SET key=${key} with TTL=${ttlSeconds}s`);
    } else {
      await this.client.set(key, value);
      this.logger.info(`[Redis] SET key=${key}`);
    }
  }

  async get(key: string) {
    const value = await this.client.get(key);
    this.logger.info(`[Redis] GET key=${key} => ${value}`);
    return value;
  }

  async del(key: string) {
    const result = await this.client.del(key);
    this.logger.info(`[Redis] DEL key=${key}`);
    return result;
  }

  onModuleDestroy() {
    this.logger.info('[Redis] Disconnecting...');
    return this.client.quit();
  }
}
