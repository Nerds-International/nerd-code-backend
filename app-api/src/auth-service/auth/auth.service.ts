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
    // Проверка на наличие зарегистрированного пользователя
    if (
      await this.userService.userExists({ username: createUserDto.username })
    ) {
      throw new BadRequestException('User already exists');
    }

    // Создание нового пользователя в случае, если пользователя с данным именем не существует
    const hashedPassword = await this.hashData(createUserDto.password);
    const newUser = await this.userService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Генерация токенов
    const { accessToken, refreshToken, hashedRefreshToken } =
      await this.getTokens(newUser.uuid, newUser.username);

    // Создание сессии и её запись в redis
    const session: SessionDto = {
      refreshToken: hashedRefreshToken,
      userAgent: req.header('User-Agent'),
      fingerprint: crypto.randomUUID(),
    };
    await this.redisService.updateSession(newUser.uuid, session);

    this.logger.log(`User with uuid ${newUser.uuid} created successfully`);

    return {
      accessToken,
      refreshToken,
    };
  }

  async signIn(req: Request, authDto: AuthDto): Promise<TokenPairDto | null> {
    const user = await this.userService.findOne({ username: authDto.username });

    // Проверка совпадения введённого пароля с действительным
    const isPasswordCorrect = await this.compareData(
      authDto.password,
      user.password,
    );
    if (!isPasswordCorrect) {
      throw new BadRequestException('Wrong password');
    }

    const { accessToken, refreshToken, hashedRefreshToken } =
      await this.getTokens(user.uuid, user.username);

    const session: SessionDto = {
      refreshToken: hashedRefreshToken,
      userAgent: req.header('User-Agent'),
      fingerprint: crypto.randomUUID(),
    };
    await this.redisService.updateSession(user.uuid, session);

    this.logger.log(`User with uuid ${user.uuid} signed in successfully`);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(uuid: string, rt: string): Promise<TokenPairDto | null> {
    const user = await this.userService.findOne({ uuid: uuid });
    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    // Получение сессии из хранилища и проверка соответсвия полученного токена с действительным
    const session = await this.redisService.getSession(user.uuid);
    if (!session.refreshToken) {
      throw new ForbiddenException('Access denied');
    }

    const tokenMatches = await this.compareData(rt, session.refreshToken);
    if (!tokenMatches) {
      throw new ForbiddenException('Access denied');
    }

    const { accessToken, refreshToken, hashedRefreshToken } =
      await this.getTokens(user.uuid, user.username);

    const newSession: SessionDto = {
      refreshToken: hashedRefreshToken,
      userAgent: session.userAgent,
      fingerprint: crypto.randomUUID(),
    };
    await this.redisService.updateSession(user.uuid, newSession);

    this.logger.log(
      `New token pair for user with uuid ${user.uuid} was generated successfully`,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async logOut(uuid: string): Promise<void> {
    await this.redisService.cleanSession(uuid);
    this.logger.log(`User with uuid ${uuid} logged out`);
  }

  async getTokens(uuid: string, username: string) {
    // Генерация новой пары токенов
    const timestamp = Date.now();
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: uuid,
          username,
          timestamp,
        },
        {
          secret: this.configService.get('JWT_ACCESS_SECRET'),
          expiresIn: '5m',
        },
      ),

      this.jwtService.signAsync(
        {
          sub: uuid,
          username,
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
