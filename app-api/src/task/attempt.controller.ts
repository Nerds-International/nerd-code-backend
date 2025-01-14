import { Controller, Get, Post, Body, Param, Put, Delete, HttpException, Query, HttpStatus, Headers,UnauthorizedException } from '@nestjs/common';
import { TaskService } from './task.service';
import { AttemptService } from './attempt.service';
import { PythonService } from './python.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { CreateAttemptDto } from './dto/attempt.dto';
import { Attempt } from './schemas/attempt.schema';
import { RedisService } from 'src/redis/redis.service';


@Controller('res')
export class AttemptController {
  constructor(private readonly taskService: TaskService, private readonly pythonService: PythonService, private readonly attemptService: AttemptService,
  private readonly redisService: RedisService
  ) {}

  @Post('attempts')
  async createAttempt(@Body() createAttemptDto: CreateAttemptDto,
  @Headers('accessToken') accessToken: string,
    @Headers('id') _id: string): Promise<Attempt> {

    const session = await this.redisService.getSession(_id);
          
    if (!accessToken || !_id || session!=accessToken){
      throw new UnauthorizedException('UUID and accessToeken are required');
    }

    return await this.attemptService.createAttempt(createAttemptDto);
  }

  @Get('attempts')
  async getAllAttempts(
    @Headers('accessToken') accessToken: string,
      @Headers('id') _id: string): Promise<Attempt[]> {

      const session = await this.redisService.getSession(_id);
          
      if (!accessToken || !_id || session!=accessToken){
        throw new UnauthorizedException('UUID and accessToeken are required');
      }
    return await this.attemptService.getAllAttempt();
  }

  @Get('attemptsByUser')
  async getAllAttemptsByUser(@Param('taskId') taskId: string,
    @Headers('accessToken') accessToken: string,
      @Headers('id') _id: string): Promise<Attempt[]> {

      const session = await this.redisService.getSession(_id);
          
      if (!accessToken || !_id || session!=accessToken){
        throw new UnauthorizedException('UUID and accessToeken are required');
      }

    const attempts = await this.attemptService.getAllAttempt();

    return attempts.filter(it => it.user_id==_id).filter(it => it.task_id==taskId);
  }

  @Get('attempts/:id')
  async getAttemptById(@Param('id') id: string,
  @Headers('accessToken') accessToken: string,
    @Headers('id') _id: string): Promise<Attempt> {

      const session = await this.redisService.getSession(_id);
          
      if (!accessToken || !_id || session!=accessToken){
        throw new UnauthorizedException('UUID and accessToeken are required');
      }
      
    return await this.attemptService.getAttemptById(id);
  }

}
