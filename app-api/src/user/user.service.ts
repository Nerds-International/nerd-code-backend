import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as argon2 from 'argon2';

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
      if (!(await this.userExists({ username }))) {
        throw new BadRequestException('User does not exist');
      }

      return this.userModel.findOne({ username }).exec();
    } else if (uuid) {
      if (!(await this.userExists({ uuid }))) {
        throw new BadRequestException('User does not exist');
      }

      return this.userModel.findOne({ uuid }).exec();
    }
  }

  async findOneByEmail(email: string): Promise<User> {
    console.log(`Searching for user with email: ${email}`);
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      console.log(`User with email ${email} not found.`);
      throw new BadRequestException('User does not exist');
    }
    console.log(`User found: ${user}`);
    return user;
  }

  async updatePasswordByEmail(email: string, newPassword: string): Promise<User> {
    const user = await this.findOneByEmail(email);
    const hashedPassword = newPassword;
    user.password = hashedPassword;
    return user.save();
  }

  async update(uuid: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (!(await this.userExists({ uuid }))) {
      throw new BadRequestException('User does not exist');
    }

    return this.userModel.findOneAndUpdate({ uuid }, updateUserDto, { new: true }).exec();
  }

  async remove(uuid: string): Promise<void> {
    if (!(await this.userExists({ uuid }))) {
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

  async userExistsByEmail(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email }).exec();
    return user !== null;
  }
}
