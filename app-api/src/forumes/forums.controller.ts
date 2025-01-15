import { Body, Controller, Get, Post, Delete, Param, Headers, UnauthorizedException} from '@nestjs/common';
import { ForumsService } from './forums.service';
import { CreateForumDto } from './dto/create-forum.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { RedisService } from 'src/redis/redis.service';


@Controller('forums')
export class ForumesController {
  constructor(private readonly formsService: ForumsService, private readonly redisService: RedisService) {}

  @Post()
  create(@Body() createFormDto: CreateForumDto, @Headers('accessToken') accessToken: string,
  @Headers('id') _id: string) {
    return this.formsService.create(createFormDto);
  }

  @Get()
  findAll() {
    return this.formsService.findAll();
  }

  @Get(':id/summery')
  async findSummary(@Param('id') id: string,
@Headers('accessToken') accessToken: string,
  @Headers('id') _id: string) {

    const session = await this.redisService.getSession(_id);
    
      if (!accessToken || !_id || session!=accessToken){
        throw new UnauthorizedException('UUID and accessToeken are required');
      }
    return this.formsService.findSummary(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string,
  @Headers('accessToken') accessToken: string,
  @Headers('id') _id: string) {

    const session = await this.redisService.getSession(_id);
    
    if (!accessToken || !_id || session!=accessToken){
      throw new UnauthorizedException('UUID and accessToeken are required');
    } 

    return this.formsService.delete(id);
  }

  @Post(':id/comments')
  async addComment(@Param('id') id: string, @Headers('accessToken') accessToken: string,
  @Headers('id') _id: string, @Body() addCommentDto: AddCommentDto) {
    const newCommentDto = { ...addCommentDto, formId: id };

    const session = await this.redisService.getSession(_id);
    
      if (!accessToken || !_id || session!=accessToken){
        throw new UnauthorizedException('UUID and accessToeken are required');
      }

    return this.formsService.addComment(newCommentDto);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Headers('accessToken') accessToken: string,
  @Headers('id') _id: string) {

    const session = await this.redisService.getSession(_id);
    
      if (!accessToken || !_id || session!=accessToken){
        throw new UnauthorizedException('UUID and accessToeken are required');
      }

    return this.formsService.findById(id);
  }

  @Post(':id/like')
  async like(@Param('id') id: string, @Headers('accessToken') accessToken: string,
  @Headers('id') _id: string) {

    const session = await this.redisService.getSession(_id);

      if (!accessToken || !_id || session!=accessToken){
        throw new UnauthorizedException('UUID and accessToeken are required');
      }

    return await this.formsService.like(id, 1);
  }

  @Post(':id/dislike')
  async dislike(@Param('id') id: string, @Headers('accessToken') accessToken: string,
  @Headers('id') _id: string) {

    const session = await this.redisService.getSession(_id);

      if (!accessToken || !_id || session!=accessToken){
        throw new UnauthorizedException('UUID and accessToeken are required');
      }

    return await this.formsService.dislike(id, 1);
  }

  @Post(':id/decrlike')
  async decrlike(@Param('id') id: string, @Headers('accessToken') accessToken: string,
  @Headers('id') _id: string) {

    const session = await this.redisService.getSession(_id);

      if (!accessToken || !_id || session!=accessToken){
        throw new UnauthorizedException('UUID and accessToeken are required');
      }

    return await this.formsService.like(id, -1);
  }

  @Post(':id/decrdislike')
  async decrdislike(@Param('id') id: string, @Headers('accessToken') accessToken: string,
  @Headers('id') _id: string) {

    const session = await this.redisService.getSession(_id);

      if (!accessToken || !_id || session!=accessToken){
        throw new UnauthorizedException('UUID and accessToeken are required');
      }

    return await this.formsService.dislike(id, -1);
  }
}
