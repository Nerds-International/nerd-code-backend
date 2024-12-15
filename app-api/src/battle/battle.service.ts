import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
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

  async getAllBattles(id: string): Promise<string> {
    try {
      const keys = await this.redisService.getKeys();
      console.log(`Количество ключей: ${keys.length}`);
      if (keys.length==0){
        const key_tmp = randomUUID()
        this.createBattle(key_tmp,id)
        return key_tmp
      }
      const current_key = keys[0];
      this.redisService.cleanSession(current_key)
      return current_key;
    } catch (error) {
      console.error('Ошибка при получении ключей:', error);
      throw error;
    }
  }
}
