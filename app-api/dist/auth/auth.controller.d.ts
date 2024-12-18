import { Request } from 'express';
import { CreateUserDto } from 'src/auth-service/user/dto/create-user.dto';
import { TokenPairDto } from './dto/tokenpair.dto';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signUp(req: Request, createUserDto: CreateUserDto): Promise<TokenPairDto | null>;
    signIn(req: Request, authDto: AuthDto): Promise<TokenPairDto | null>;
    refreshTokens(req: Request, payload: any): Promise<TokenPairDto | null>;
    logOut(req: Request): void;
}
