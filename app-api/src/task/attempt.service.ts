
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attempt, AttemptDocument } from './schemas/attempt.schema';
import { CreateAttemptDto } from './dto/attempt.dto';

@Injectable()
export class AttemptService {
  constructor(
    @InjectModel(Attempt.name) private readonly attemptModel: Model<AttemptDocument>,
  ) {}

  async createAttempt(createAttemptDto: CreateAttemptDto): Promise<Attempt> {
    const createdTask = new this.attemptModel({
      ...createAttemptDto,
      created_at: new Date(),
    });
    return createdTask.save();
  }

  async getAllAttempt(): Promise<Attempt[]> {
    return this.attemptModel.find().exec();
  }

  async getAttemptById(attemptId: string): Promise<Attempt> {
    const task = await this.attemptModel.findById(attemptId).exec();
    if (!task) {
      throw new NotFoundException(`Attempt with ID ${attemptId} not found`);
    }
    return task;
  }

}