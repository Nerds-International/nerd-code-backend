import { Controller, Get, Param, Headers } from '@nestjs/common';
import { BattleService } from './battle.service';
import { RedisService } from 'src/redis/redis.service';

@Controller('battles')
export class BattleController {
  constructor(private readonly battleService: BattleService,
    private readonly redisService: RedisService
  ) {}

  @Get('getKeys')
  getAllBattles(@Param('id') id: string,
  @Headers('accessToken') accessToken: string,
  @Headers('_id') _id: string
): Promise<string> {
    
  const session = this.redisService.getSession(_id);

  console.log(_id)
  console.log(JSON.stringify(session)+"123")


//  if (!_id || !accessToken || (this.redisService.getSession(_id)==accessToken)) {
//    throw new UnauthorizedException('UUID and refreshToken are required');
//  }

    return this.battleService.getAllBattles(id);
  }
}
