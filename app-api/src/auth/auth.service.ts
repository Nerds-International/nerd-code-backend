import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { TokenPairDto } from './dto/tokenpair.dto';
import { SessionDto } from './dto/session.dto';
import { Request } from 'express';
import { AuthDto } from './dto/auth.dto';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  private readonly logger: Logger = new Logger();

  async signUp(
    req: Request,
    createUserDto: CreateUserDto,
  ): Promise<TokenPairDto | null> {
    if (
      await this.userService.userExists({ username: createUserDto.username })
    ) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await this.hashData(createUserDto.password);
    const newUser = await this.userService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const { accessToken, refreshToken, hashedRefreshToken } =
      await this.getTokens(newUser.username);

    const sessionId = crypto.randomUUID();
    await this.redisService.updateSession(sessionId, accessToken);

    this.logger.log(`User with username ${newUser.username} created successfully`);

    return {
      sessionId,
      accessToken,
      refreshToken,
    };
  }

  async signIn(req: Request, authDto: AuthDto): Promise<TokenPairDto | null> {
    const user = await this.userService.findOne({ username: authDto.email });

    const isPasswordCorrect = await this.compareData(
      authDto.password,
      user.password,
    );
    if (!isPasswordCorrect) {
      throw new BadRequestException('Wrong password');
    }

    const { accessToken, refreshToken, hashedRefreshToken } =
      await this.getTokens(user.username);

    const sessionId = crypto.randomUUID();
    const session: SessionDto = {
      sessionname: sessionId,
      refreshToken: hashedRefreshToken,
      userAgent: req.header('User-Agent'),
      fingerprint: crypto.randomUUID(),
    };
    await this.redisService.updateSession(sessionId, accessToken);

    this.logger.log(`User with username ${user.username} signed in successfully`);

    return {
      sessionId,
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(sessionId: string, rt: string): Promise<TokenPairDto | null> {
    const session = await this.redisService.getSession(sessionId);
    if (!session.refreshToken) {
      throw new ForbiddenException('Access denied');
    }

    const tokenMatches = await this.compareData(rt, session.refreshToken);
    if (!tokenMatches) {
      throw new ForbiddenException('Access denied');
    }

    const { accessToken, refreshToken, hashedRefreshToken } =
      await this.getTokens(session.sessionname);

    const newSession: SessionDto = {
      sessionname: sessionId,
      refreshToken: hashedRefreshToken,
      userAgent: session.userAgent,
      fingerprint: crypto.randomUUID(),
    };
    await this.redisService.updateSession(sessionId, accessToken);

    this.logger.log(
      `New token pair for user with sessionId ${sessionId} was generated successfully`,
    );

    return {
      sessionId,
      accessToken,
      refreshToken,
    };
  }

  async logOut(sessionId: string): Promise<void> {
    await this.redisService.cleanSession(sessionId);
    this.logger.log(`User with sessionId ${sessionId} logged out`);
  }

  async resetPassword(req: Request, authDto: AuthDto): Promise<void> {
    const email = authDto.email;
    const hashedPassword = await this.hashData(authDto.password);
    await this.userService.updatePasswordByEmail(authDto.email, hashedPassword);
    this.logger.log(`Password updated successfully for user with email ${authDto.email}`);
  }

  async getTokens(username: string) {
    const timestamp = Date.now();
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: username,
          timestamp,
        },
        {
          secret: this.configService.get('JWT_ACCESS_SECRET'),
          expiresIn: '5m',
        },
      ),

      this.jwtService.signAsync(
        {
          sub: username,
          timestamp,
        },
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    const hashedRefreshToken = await this.hashData(refreshToken);

    return {
      accessToken,
      refreshToken,
      hashedRefreshToken,
    };
  }

  async hashData(data: string): Promise<string> {
    return argon2.hash(data);
  }

  async compareData(data: string, hashedData: string): Promise<boolean> {
    return argon2.verify(hashedData, data);
  }
}
