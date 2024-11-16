import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { TokenPairDto } from './dto/tokenpair.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return this.generateTokens(user);
  }

  async signIn({ email, password }: { email: string; password: string }) {
    const user = await this.userService.validateUser(email, password);
    return this.generateTokens(user);
  }

  async refreshTokens(uuid: string, refreshToken: string) {
    const user = await this.userService.findByUuid(uuid);
    if (!user || user['refreshToken'] !== refreshToken) {
      throw new BadRequestException('Invalid refresh token');
    }

    return this.generateTokens(user);
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
    const existingUser = await this.userService.findOneByEmail(oAuthUser.email);

    if (existingUser) {
      return this.generateTokens(existingUser);
    }

    const newUser = await this.userService.create({
      email: oAuthUser.email,
      username: oAuthUser.username || oAuthUser.email.split('@')[0],
      fullname: oAuthUser.name,
      avatar_number: '1',
      password: null,
    });

    return this.generateTokens(newUser);
  }
}
