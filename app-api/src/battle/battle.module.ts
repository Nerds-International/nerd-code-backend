import { Module } from '@nestjs/common';
import { BattleGateway } from './battle.gateway';
import { RedisModule } from 'src/redis/redis.module';
import { BattleService } from './battle.service';

@Module({
  imports: [RedisModule],
  providers: [BattleGateway, BattleService],
})
export class BattleModule {}
