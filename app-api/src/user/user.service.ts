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
    const { username, email, password } = createUserDto;

    if (await this.userExistsByEmail(email)) {
      throw new BadRequestException('User with this email already exists');
    }

    if (await this.userExists({ username })) {
      throw new BadRequestException('User with this username already exists');
    }

    const hashedPassword = await argon2.hash(password);
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }
    return user;
  }

  async findByUuid(uuid: string): Promise<User> {
    const user = await this.userModel.findOne({ uuid }).exec();
    if (!user) {
      throw new BadRequestException('User with this UUID does not exist');
    }
    return user;
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.findOneByEmail(email);
    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid email or password');
    }

    return user;
  }

  async updatePasswordByEmail(email: string, newPassword: string): Promise<User> {
    const user = await this.findOneByEmail(email);
    const hashedPassword = await argon2.hash(newPassword);
    user.password = hashedPassword;

    return user.save();
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    user['refreshToken'] = refreshToken;
    await user.save();
  }

  async removeRefreshToken(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (user) {
      user['refreshToken'] = null;
      await user.save();
    }
  }

  async userExists({ username = null, uuid = null }): Promise<boolean> {
    if (username) {
      const user = await this.userModel.findOne({ username }).exec();
      return user !== null;
    }
    if (uuid) {
      const user = await this.userModel.findOne({ uuid }).exec();
      return user !== null;
    }
    return false;
  }

  async userExistsByEmail(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email }).exec();
    return user !== null;
  }
}
