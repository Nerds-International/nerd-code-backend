import { Controller, Get, Post, Body, Param, Put, Delete, HttpException, Query, HttpStatus } from '@nestjs/common';
import { TaskService } from './task.service';
import { PythonService } from './python.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService, private readonly pythonService: PythonService) {}

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
  async executePython(@Body('code') code: string): Promise<any> {
    if (!code) {
      throw new HttpException('Code is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.pythonService.executeCode(code);
      return { success: true, result };
    } catch (error) {
      throw new HttpException(
        `Error executing code: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
