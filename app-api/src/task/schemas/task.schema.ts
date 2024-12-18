import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema()
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  difficulty: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ required: true })
  time_limit: number;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: 0 })
  dislikes: number;

  @Prop({ default: 0 })
  input_type: number;

  @Prop({ default: 0 })
  output_type: number;

  @Prop({ required: true, type: Array })
  test_cases: Array<{ input: string; expected_output: string }>;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
