import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Forum } from './schemas/forum.schema';
import { CreateFormDto } from './dto/create-forum.dto';
import { ViewFormSummaryDto } from './dto/view-forum-summery.dto';
import { AddCommentDto } from './dto/add-comment.dto';

@Injectable()
export class ForumsService {
  constructor(@InjectModel(Forum.name) private formModel: Model<Forum>) {}

  async create(createFormDto: CreateFormDto): Promise<Forum> {
    const createdForm = new this.formModel(createFormDto);
    return createdForm.save();
  }

  async findAll(): Promise<Forum[]> {
    return this.formModel.find().exec();
  }

  async delete(id: string): Promise<Forum> {
    return this.formModel.findByIdAndDelete(id).exec();
  }

  async findSummary(id: string): Promise<ViewFormSummaryDto> {
    const form = await this.formModel.findById(id).exec();
    return {
      id: form.id,
      title: form.title,
      author_id: form.author_id,
      likes: form.likes,
      created_at: form.created_at,
    };
  }

  async addComment(addCommentDto: AddCommentDto): Promise<Forum> {
    const form = await this.formModel.findById(addCommentDto.formId).exec();
    form.comments.push({
      user_id: addCommentDto.userId,
      comment: addCommentDto.comment,
      created_at: new Date(),
    });
    return form.save();
  }

  async findById(id: string): Promise<Forum> {
    return this.formModel.findById(id).exec();
  }
  
}
