import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class BattleService {
  constructor(private readonly redisService: RedisService) {}

  async createBattle(battleId: string, userId: string) {
    const battle = { userId, status: 'waiting' };
    await this.redisService.updateSession(battleId, JSON.stringify(battle));
  }

  async checkBattle(battleId: string): Promise<boolean> {
    const battle = await this.redisService.getSession(battleId);
    return !!battle;
  }
}
