import { Controller, Get, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { BattleService } from './battle.service';
import { RedisService } from 'src/redis/redis.service';

@Controller('battles')
export class BattleController {
  constructor(private readonly battleService: BattleService,
    private readonly redisService: RedisService
  ) {}

  @Get('getKeys')
  async getAllBattles(@Param('id') id: string,
  @Headers('accessToken') accessToken: string,
  @Headers('_id') _id: string
): Promise<string> {
    
  const session = await this.redisService.getSession(_id);

  if (!accessToken || !_id || session!=accessToken){
    throw new UnauthorizedException('UUID and accessToeken are required');
  }


//  if (!_id || !accessToken || (this.redisService.getSession(_id)==accessToken)) {
//    throw new UnauthorizedException('UUID and refreshToken are required');
//  }

    return this.battleService.getAllBattles(id);
  }
}
