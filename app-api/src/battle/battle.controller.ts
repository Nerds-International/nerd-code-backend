import { Controller, Get, Param } from '@nestjs/common';
import { BattleService } from './battle.service';

@Controller('battles')
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Get('getBatttlesKeys')
  getAllBattles(@Param('id') id: string): Promise<string> {
    return this.battleService.getAllBattles(id);
  }
}
