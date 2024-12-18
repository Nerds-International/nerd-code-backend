"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
let UserService = class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async create(createUserDto) {
        if (await this.userExists({ username: createUserDto.username })) {
            throw new common_1.BadRequestException('User already exist');
        }
        const user = new user_entity_1.User();
        user.username = createUserDto.username;
        user.password = createUserDto.password;
        return this.userRepository.save(user);
    }
    async findAll() {
        return this.userRepository.find();
    }
    async findOne({ username = null, uuid = null }) {
        if (username) {
            if (!(await this.userExists({ username: username }))) {
                throw new common_1.BadRequestException('User does not exist');
            }
            return this.userRepository.findOneBy({ username });
        }
        else if (uuid) {
            if (!(await this.userExists({ uuid: uuid }))) {
                throw new common_1.BadRequestException('User does not exist');
            }
            return this.userRepository.findOneBy({ uuid });
        }
    }
    async update(uuid, updateUserDto) {
        if (!(await this.userExists({ uuid: uuid }))) {
            throw new common_1.BadRequestException('User does not exist');
        }
        await this.userRepository.update({ uuid }, updateUserDto);
        return this.userRepository.findOneBy({ uuid });
    }
    async remove(uuid) {
        if (!(await this.userExists({ uuid: uuid }))) {
            throw new common_1.BadRequestException('User does not exists');
        }
        await this.userRepository.delete({ uuid });
    }
    async userExists({ username = null, uuid = null }) {
        if (username) {
            const user = await this.userRepository.findOneBy({ username });
            return user !== null;
        }
        else if (uuid) {
            const user = await this.userRepository.findOneBy({ uuid });
            return user !== null;
        }
    }
};
UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map