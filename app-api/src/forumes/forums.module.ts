import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ForumesController } from './forums.controller';
import { ForumsService } from './forums.service';
import { Forum, ForumSchema } from './schemas/forum.schema';
import { RedisModule } from 'src/redis/redis.module';


@Module({
  imports: [MongooseModule.forFeature([{ name: Forum.name, schema: ForumSchema }]), RedisModule],
  controllers: [ForumesController],
  providers: [ForumsService],
})
export class ForumsModule {}