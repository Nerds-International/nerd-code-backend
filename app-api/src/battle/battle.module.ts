import { Module } from '@nestjs/common';
import { BattleGateway } from './battle.gateway';
import { RedisModule } from 'src/redis/redis.module';
import { BattleService } from './battle.service';
import { BattleController } from './battle.controller';

@Module({
  imports: [RedisModule],
  providers: [BattleGateway, BattleService],
  controllers: [BattleController]
})
export class BattleModule {}
