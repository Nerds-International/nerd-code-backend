import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AccessTokenGuard } from 'src/auth/guards';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}


}
