
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
  ) {}

  // Создание задачи
  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const createdTask = new this.taskModel({
      ...createTaskDto,
      created_at: new Date(),
    });
    return createdTask.save();
  }

  // Получение всех задач
  async getAllTasks(): Promise<Task[]> {
    return this.taskModel.find().exec();
  }

  // Получение задачи по ID
  async getTaskById(taskId: string): Promise<Task> {
    const task = await this.taskModel.findById(taskId).exec();
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    return task;
  }

  // Обновление задачи по ID
  async updateTask(taskId: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const updatedTask = await this.taskModel
      .findByIdAndUpdate(taskId, updateTaskDto, { new: true })
      .exec();
    if (!updatedTask) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    return updatedTask;
  }

  // Удаление задачи по ID
  async deleteTask(taskId: string): Promise<void> {
    const result = await this.taskModel.findByIdAndDelete(taskId).exec();
    if (!result) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
  }

  async getAllTasksWithPagination(page: number, limit: number): Promise<{ tasks: Task[]; total: number }> {
    const skip = (page - 1) * limit;
    const [tasks, total] = await Promise.all([
      this.taskModel.find().skip(skip).limit(limit).exec(),
      this.taskModel.countDocuments().exec(),
    ]);
    return { tasks, total };
  }

}