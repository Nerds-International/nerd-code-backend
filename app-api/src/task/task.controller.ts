import { Controller, Get, Post, Body, Param, Put, Delete, HttpException, Query, HttpStatus } from '@nestjs/common';
import { TaskService } from './task.service';
import { AttemptService } from './attempt.service';
import { PythonService } from './python.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { CreateAttemptDto } from './dto/attempt.dto';
import { Attempt } from './schemas/attempt.schema';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService, private readonly pythonService: PythonService, private readonly attemptService: AttemptService) {}

  @Post()
  createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.createTask(createTaskDto);
  }

  @Get('list')
  getAllTasks(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.taskService.getAllTasksWithPagination(page, limit);
  }

  @Get(':id')
  getTaskById(@Param('id') id: string) {
    return this.taskService.getTaskById(id);
  }

  @Put(':id')
  updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.updateTask(id, updateTaskDto);
  }

  @Delete(':id')
  deleteTask(@Param('id') id: string) {
    return this.taskService.deleteTask(id);
  }

  @Post('execute')
async executePythonWithTests(@Body('code') code: string, @Body('tests') tests: { input: string; expected: string }[]) {
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

  @Post('attempts')
  async createAttempt(@Body() createAttemptDto: CreateAttemptDto): Promise<Attempt> {
    return this.attemptService.createAttempt(createAttemptDto);
  }

  @Get('attempts')
  async getAllAttempts(): Promise<Attempt[]> {
    return this.attemptService.getAllAttempt();
  }

  @Get('attempts/:id')
  async getAttemptById(@Param('id') id: string): Promise<Attempt> {
    return this.attemptService.getAttemptById(id);
  }
}
