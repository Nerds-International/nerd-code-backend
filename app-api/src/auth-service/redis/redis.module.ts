import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { RedisClientOptions } from 'redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ttl } from 'src/constants';
import { RedisService } from './redis.service';

@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        password: configService.get('REDIS_PASSWORD'),
        database: configService.get('REDIS_DB'),
        ttl: ttl,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
