import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/auth-service/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from 'src/auth-service/redis/redis.module';

@Module({
  imports: [JwtModule.register({}), UserModule, ConfigModule, RedisModule],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
