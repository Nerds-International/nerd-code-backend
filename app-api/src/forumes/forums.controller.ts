import { Body, Controller, Get, Post, Delete, Param } from '@nestjs/common';
import { ForumsService } from './forums.service';
import { CreateFormDto } from './dto/create-forum.dto';
import { AddCommentDto } from './dto/add-comment.dto';

@Controller('forums')
export class ForumesController {
  constructor(private readonly formsService: ForumsService) {}

  @Post()
  create(@Body() createFormDto: CreateFormDto) {
    return this.formsService.create(createFormDto);
  }

  @Get()
  findAll() {
    return this.formsService.findAll();
  }

  @Get(':id/summery')
  findSummary(@Param('id') id: string) {
    return this.formsService.findSummary(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.formsService.delete(id);
  }

  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body() addCommentDto: AddCommentDto) {
    const newCommentDto = { ...addCommentDto, formId: id };
    return this.formsService.addComment(newCommentDto);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.formsService.findById(id);
  }

}
