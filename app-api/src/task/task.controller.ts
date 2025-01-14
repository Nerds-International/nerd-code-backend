import { Controller, Get, Post, Body, Param, Put, Delete, HttpException, Query, HttpStatus, Headers,UnauthorizedException } from '@nestjs/common';
import { TaskService } from './task.service';
import { AttemptService } from './attempt.service';
import { PythonService } from './python.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { CreateAttemptDto } from './dto/attempt.dto';
import { Attempt } from './schemas/attempt.schema';
import { RedisService } from 'src/redis/redis.service';


@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService, private readonly pythonService: PythonService, private readonly attemptService: AttemptService,
  private readonly redisService: RedisService
  ) {}

  @Post()
  createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.createTask(createTaskDto);
  }

  @Get('list')
  getAllTasks(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.taskService.getAllTasksWithPagination(page, limit);
  }

  @Get(':id')
  async getTaskById(@Param('id') id: string,
  @Headers('accessToken') accessToken: string,
    @Headers('id') _id: string) {
    return await this.taskService.getTaskById(id);
  }

  @Put(':id')
  async updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto,
  @Headers('accessToken') accessToken: string,
    @Headers('id') _id: string) {

      const session = await this.redisService.getSession(_id);
          
      if (!accessToken || !_id || session!=accessToken){
        throw new UnauthorizedException('UUID and accessToeken are required');
      }
    return this.taskService.updateTask(id, updateTaskDto);
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string,
  @Headers('accessToken') accessToken: string,
    @Headers('id') _id: string) {

      const session = await this.redisService.getSession(_id);
          
      if (!accessToken || !_id || session!=accessToken){
        throw new UnauthorizedException('UUID and accessToeken are required');
      }

    return this.taskService.deleteTask(id);
  }

  @Post('execute')
async executePythonWithTests(@Body('code') code: string, @Body('tests') tests: { input: string; expected: string }[],
@Headers('accessToken') accessToken: string,
  @Headers('id') _id: string) {

    const session = await this.redisService.getSession(_id);
          
    if (!accessToken || !_id || session!=accessToken){
      throw new UnauthorizedException('UUID and accessToeken are required');
    }

  if (!code || !tests) {
    throw new HttpException('Code and tests are required', HttpStatus.BAD_REQUEST);
  }

  try {
    const result = await this.pythonService.executeCodeWithTests(code, tests);
    return { success: true, result };
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}

  @Post(':id/like')
  async like(@Param('id') id: string, @Headers('accessToken') accessToken: string,
  @Headers('id') _id: string) {

    const session = await this.redisService.getSession(_id);

      if (!accessToken || !_id || session!=accessToken){
        throw new UnauthorizedException('UUID and accessToeken are required');
      }

    return await this.taskService.like(id, 1);
  }

  @Post(':id/dislike')
  async dislike(@Param('id') id: string, @Headers('accessToken') accessToken: string,
  @Headers('id') _id: string) {

    const session = await this.redisService.getSession(_id);

      if (!accessToken || !_id || session!=accessToken){
        throw new UnauthorizedException('UUID and accessToeken are required');
      }

    return await this.taskService.dislike(id, 1);
  }

  @Post(':id/derclike')
  async derclike(@Param('id') id: string, @Headers('accessToken') accessToken: string,
  @Headers('id') _id: string) {

    const session = await this.redisService.getSession(_id);

      if (!accessToken || !_id || session!=accessToken){
        throw new UnauthorizedException('UUID and accessToeken are required');
      }

    return await this.taskService.like(id, -1);
  }

  @Post(':id/dercdislike')
  async decrdislike(@Param('id') id: string, @Headers('accessToken') accessToken: string,
  @Headers('id') _id: string) {

    const session = await this.redisService.getSession(_id);

      if (!accessToken || !_id || session!=accessToken){
        throw new UnauthorizedException('UUID and accessToeken are required');
      }

    return await this.taskService.dislike(id, -1);
  }
}
