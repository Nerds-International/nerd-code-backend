import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AttemptDocument = Attempt & Document;

@Schema()
export class Attempt {

  @Prop({ required: true })
  result: string;
  @Prop({ required: true })
  task_id: String
  @Prop({ required: true })
  user_id: String
  @Prop({ required: true })
  language: String
  @Prop({ required: true })
  time: string;
}

export const AttemptSchema = SchemaFactory.createForClass(Attempt);
