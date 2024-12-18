import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ForumesController } from './forums.controller';
import { ForumsService } from './forums.service';
import { Forum, ForumSchema } from './schemas/forum.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Forum.name, schema: ForumSchema }])],
  controllers: [ForumesController],
  providers: [ForumsService],
})
export class ForumsModule {}