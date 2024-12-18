import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/task.schema';
import { Attempt, AttemptSchema } from './schemas/attempt.schema';
import { PythonService } from './python.service';
import { AttemptService } from './attempt.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]), MongooseModule.forFeature([{ name: Attempt.name, schema: AttemptSchema }])],
  controllers: [TaskController],
  providers: [TaskService, PythonService, AttemptService],
  exports: [TaskService, PythonService, AttemptService],
})
export class TaskModule {}
