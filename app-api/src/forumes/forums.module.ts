import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ForumesController } from './forums.controller';
import { ForumsService } from './forums.service';
import { Forum, FormSchema } from './schemas/forum.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Forum.name, schema: FormSchema }])],
  controllers: [ForumesController],
  providers: [ForumsService],
})
export class FormsModule {}