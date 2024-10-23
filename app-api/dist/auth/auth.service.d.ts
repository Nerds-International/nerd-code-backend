import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { CreateUserDto } from 'src/auth-service/user/dto/create-user.dto';
import { TokenPairDto } from './dto/tokenpair.dto';
import { Request } from 'express';
import { AuthDto } from './dto/auth.dto';
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    private readonly configService;
    private readonly redisService;
    constructor(userService: UserService, jwtService: JwtService, configService: ConfigService, redisService: RedisService);
    private readonly logger;
    signUp(req: Request, createUserDto: CreateUserDto): Promise<TokenPairDto | null>;
    signIn(req: Request, authDto: AuthDto): Promise<TokenPairDto | null>;
    refreshTokens(uuid: string, rt: string): Promise<TokenPairDto | null>;
    logOut(uuid: string): Promise<void>;
    getTokens(uuid: string, username: string): Promise<{
        accessToken: string;
        refreshToken: string;
        hashedRefreshToken: string;
    }>;
    hashData(data: string): Promise<string>;
    compareData(data: string, hashedData: string): Promise<boolean>;
}
