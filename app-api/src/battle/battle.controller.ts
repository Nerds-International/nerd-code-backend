import { Controller, Get, Param } from '@nestjs/common';
import { BattleService } from './battle.service';

@Controller('battles')
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Get('getKeys')
  getAllBattles(@Param('id') id: string): Promise<string> {
    
    return this.battleService.getAllBattles(id);
  }
}
