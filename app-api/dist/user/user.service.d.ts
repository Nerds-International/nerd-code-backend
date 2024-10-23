import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne({ username, uuid }: {
        username?: any;
        uuid?: any;
    }): Promise<User>;
    update(uuid: string, updateUserDto: UpdateUserDto): Promise<User>;
    remove(uuid: string): Promise<void>;
    userExists({ username, uuid }: {
        username?: any;
        uuid?: any;
    }): Promise<boolean>;
}
