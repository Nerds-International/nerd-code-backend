import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { TokenPairDto } from './dto/tokenpair.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    const tokens =this.generateTokens(user);
    this.redisService.updateSession(tokens.id, JSON.stringify(user));
    return tokens;
  }

  async signIn({ email, password }: { email: string; password: string }) {
    const user = await this.userService.validateUser(email, password);
    const tokens =this.generateTokens(user);
    this.redisService.updateSession(tokens.id, JSON.stringify(user));
    return tokens;
  }

  async refreshTokens(uuid: string, refreshToken: string) {
    const user = await this.userService.findByUuid(uuid);
    if (!user || user['refreshToken'] !== refreshToken) {
      throw new BadRequestException('Invalid refresh token');
    }

    const tokens =this.generateTokens(user);
    this.redisService.updateSession(tokens.id, JSON.stringify(user));
    return tokens;
  }

  async resetPassword({ email, password }: { email: string; password: string }) {
    await this.userService.updatePasswordByEmail(email, password);
  }

  logOut(userId: string) {
    this.userService.removeRefreshToken(userId);
  }

  private generateTokens(user: any) {

    const payload = { sub: user.id, username: user.username };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    this.userService.updateRefreshToken(user.id, refreshToken);

    const id = user.id;

    return { id, accessToken, refreshToken };
  }

  async validateOAuthUser(oAuthUser: any): Promise<TokenPairDto> {
    const existingUser = await this.userService.findOneByEmailBool(oAuthUser.email);

    if (existingUser) {
      const user =await this.userService.findOneByEmail(oAuthUser.email)
      const tokens = this.generateTokens(user);
      console.log(JSON.stringify(user))
      await this.redisService.updateSession(tokens.id, JSON.stringify(user));
      console.log(JSON.stringify(this.redisService.getKeys())+123)
      return this.generateTokens(await this.userService.findOneByEmail(oAuthUser.email));
    }

    const newUser = await this.userService.create({
      email: oAuthUser.email,
      username: oAuthUser.username || oAuthUser.email.split('@')[0],
      fullname: oAuthUser.name,
      avatar_number: '1',
      password: null,
    });

    const tokens =this.generateTokens(newUser);
    await this.redisService.updateSession(tokens.id, JSON.stringify(newUser));

    return tokens;
  }
}
