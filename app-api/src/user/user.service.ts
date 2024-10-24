import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    if (await this.userExists({ username: createUserDto.username })) {
      throw new BadRequestException('User already exists');
    }

    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne({ username = null, uuid = null }): Promise<User> {
    if (username) {
      if (!(await this.userExists({ username: username }))) {
        throw new BadRequestException('User does not exist');
      }

      return this.userModel.findOne({ username }).exec();
    } else if (uuid) {
      if (!(await this.userExists({ uuid: uuid }))) {
        throw new BadRequestException('User does not exist');
      }

      return this.userModel.findOne({ uuid }).exec();
    }
  }

  async update(uuid: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (!(await this.userExists({ uuid: uuid }))) {
      throw new BadRequestException('User does not exist');
    }

    return this.userModel.findOneAndUpdate({ uuid }, updateUserDto, { new: true }).exec();
  }

  async remove(uuid: string): Promise<void> {
    if (!(await this.userExists({ uuid: uuid }))) {
      throw new BadRequestException('User does not exist');
    }

    await this.userModel.deleteOne({ uuid }).exec();
  }

  async userExists({ username = null, uuid = null }): Promise<boolean> {
    if (username) {
      const user = await this.userModel.findOne({ username }).exec();
      return user !== null;
    } else if (uuid) {
      const user = await this.userModel.findOne({ uuid }).exec();
      return user !== null;
    }
  }
}
