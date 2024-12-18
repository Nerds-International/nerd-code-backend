import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AttemptDocument = Attempt & Document;

@Schema()
export class Attempt {

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  result: string;
}

export const AttemptSchema = SchemaFactory.createForClass(Attempt);
