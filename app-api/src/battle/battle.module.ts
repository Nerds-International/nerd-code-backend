import { Module } from '@nestjs/common';
import { BattleGateway } from './battle.gateway';
import { RedisModule } from 'src/redis/redis.module';
import { BattleService } from './battle.service';
import { BattleController } from './battle.controller';
import { TaskService } from 'src/task/task.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from 'src/task/schemas/task.schema';

@Module({
  imports: [RedisModule, MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }])],
  providers: [BattleGateway, BattleService, TaskService],
  controllers: [BattleController]
})
export class BattleModule { }
