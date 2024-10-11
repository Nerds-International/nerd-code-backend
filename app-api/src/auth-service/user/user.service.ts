import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    if (await this.userExists({ username: createUserDto.username })) {
      throw new BadRequestException('User already exist');
    }

    const email = createUserDto.email;
    const userWithSameEmail = await this.userRepository.findOneBy({ email });
    if (userWithSameEmail) {
      throw new BadRequestException(
        'User with this email address already exists',
      );
    }

    const user = new User();

    user.email = createUserDto.email;
    user.firstname = createUserDto.firstname;
    user.lastname = createUserDto.lastname;
    user.username = createUserDto.username;
    user.password = createUserDto.password;

    user.createdAt = new Date();

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne({ username=null, uuid=null }): Promise<User> {
    if (username) {
      if (!(await this.userExists({ username: username }))) {
        throw new BadRequestException('User does not exist');
      }

      return this.userRepository.findOneBy({ username });
    } else if (uuid) {
      if (!(await this.userExists({ uuid: uuid }))) {
        throw new BadRequestException('User does not exist');
      }

      return this.userRepository.findOneBy({ uuid });
    }
  }

  async update(uuid: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (!(await this.userExists({ uuid: uuid }))) {
      throw new BadRequestException('User does not exist');
    }

    await this.userRepository.update({ uuid }, updateUserDto);
    return this.userRepository.findOneBy({ uuid });
  }

  async remove(uuid: string): Promise<void> {
    if (!(await this.userExists({ uuid: uuid }))) {
      throw new BadRequestException('User does not exists');
    }

    await this.userRepository.delete({ uuid });
  }

  async userExists({ username = null, uuid = null }): Promise<boolean> {
    if (username) {
      const user = await this.userRepository.findOneBy({ username });
      return user !== null;
    } else if (uuid) {
      const user = await this.userRepository.findOneBy({ uuid });
      return user !== null;
    }
  }
}
