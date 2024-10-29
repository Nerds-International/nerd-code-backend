import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Forum extends Document {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  author_id: string;

  @Prop()
  likes: number;

  @Prop()
  created_at: Date;

  @Prop([
    {
      user_id: String,
      comment: String,
      created_at: Date,
    },
  ])
  comments: Comment[];
}

export type Comment = {
  user_id: string;
  comment: string;
  created_at: Date;
};

export const FormSchema = SchemaFactory.createForClass(Forum);
