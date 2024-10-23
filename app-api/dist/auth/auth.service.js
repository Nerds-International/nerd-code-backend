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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../user/user.service");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const redis_service_1 = require("../redis/redis.service");
const argon2 = require("argon2");
const crypto = require("crypto");
let AuthService = class AuthService {
    constructor(userService, jwtService, configService, redisService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.redisService = redisService;
        this.logger = new common_1.Logger();
    }
    async signUp(req, createUserDto) {
        if (await this.userService.userExists({ username: createUserDto.username })) {
            throw new common_1.BadRequestException('User already exists');
        }
        const hashedPassword = await this.hashData(createUserDto.password);
        const newUser = await this.userService.create({
            ...createUserDto,
            password: hashedPassword,
        });
        const { accessToken, refreshToken, hashedRefreshToken } = await this.getTokens(newUser.uuid, newUser.username);
        await this.redisService.updateSession(newUser.uuid, accessToken);
        this.logger.log(`User with uuid ${newUser.uuid} created successfully`);
        const uuid = newUser.uuid;
        return {
            uuid,
            accessToken,
            refreshToken,
        };
    }
    async signIn(req, authDto) {
        const user = await this.userService.findOne({ username: authDto.username });
        const isPasswordCorrect = await this.compareData(authDto.password, user.password);
        if (!isPasswordCorrect) {
            throw new common_1.BadRequestException('Wrong password');
        }
        const { accessToken, refreshToken, hashedRefreshToken } = await this.getTokens(user.uuid, user.username);
        const session = {
            refreshToken: hashedRefreshToken,
            userAgent: req.header('User-Agent'),
            fingerprint: crypto.randomUUID(),
        };
        await this.redisService.updateSession(user.uuid, accessToken);
        this.logger.log(`User with uuid ${user.uuid} signed in successfully`);
        const uuid = user.uuid;
        return {
            uuid,
            accessToken,
            refreshToken,
        };
    }
    async refreshTokens(uuid, rt) {
        const user = await this.userService.findOne({ uuid: uuid });
        if (!user) {
            throw new common_1.BadRequestException('User does not exist');
        }
        const session = await this.redisService.getSession(user.uuid);
        if (!session.refreshToken) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const tokenMatches = await this.compareData(rt, session.refreshToken);
        if (!tokenMatches) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const { accessToken, refreshToken, hashedRefreshToken } = await this.getTokens(user.uuid, user.username);
        const newSession = {
            refreshToken: hashedRefreshToken,
            userAgent: session.userAgent,
            fingerprint: crypto.randomUUID(),
        };
        await this.redisService.updateSession(user.uuid, accessToken);
        this.logger.log(`New token pair for user with uuid ${user.uuid} was generated successfully`);
        return {
            uuid,
            accessToken,
            refreshToken,
        };
    }
    async logOut(uuid) {
        await this.redisService.cleanSession(uuid);
        this.logger.log(`User with uuid ${uuid} logged out`);
    }
    async getTokens(uuid, username) {
        const timestamp = Date.now();
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({
                sub: uuid,
                username,
                timestamp,
            }, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
                expiresIn: '5m',
            }),
            this.jwtService.signAsync({
                sub: uuid,
                username,
                timestamp,
            }, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            }),
        ]);
        const hashedRefreshToken = await this.hashData(refreshToken);
        return {
            accessToken,
            refreshToken,
            hashedRefreshToken,
        };
    }
    async hashData(data) {
        return argon2.hash(data);
    }
    async compareData(data, hashedData) {
        return argon2.verify(hashedData, data);
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService,
        config_1.ConfigService,
        redis_service_1.RedisService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map