import { 
  Body, 
  Controller, 
  Get, 
  Post, 
  Req, 
  Res, 
  UseGuards ,
  UnauthorizedException,
  Headers
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { TokenPairDto } from './dto/tokenpair.dto';
import { AuthDto } from './dto/auth.dto';
import { AccessTokenGuard, RefreshTokenGuard } from './guards';
import { AuthGuard } from '@nestjs/passport';
import { RedisService } from 'src/redis/redis.service';
import { User } from 'src/user/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly redisService: RedisService
  ) {}

  @Post('signup')
  async signUp(
    @Body() createUserDto: CreateUserDto
  ): Promise<TokenPairDto> {
    return this.authService.signUp(createUserDto);
  }

  @Post('signin')
  async signIn(
    @Body() authDto: AuthDto
  ): Promise<TokenPairDto> {
    return this.authService.signIn(authDto);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshTokens(
    @Req() req: Request
  ): Promise<TokenPairDto> {

    const { uuid, refreshToken, accessToken } = req.body;

    if (!uuid || !refreshToken) {
      throw new UnauthorizedException('UUID and refreshToken are required');
    }

    return this.authService.refreshTokens(uuid, refreshToken);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() authDto: AuthDto
  ): Promise<void> {
    const { email, password } = authDto;
    return this.authService.resetPassword({email, password});
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  logOut(@Req() req: Request): void {
    const userId = req.user['sub'];
    this.authService.logOut(userId);
  }

  @Get('getUser')
  async getUserByUUID(@Req() req: Request, @Headers('accessToken') accessToken: string,
    @Headers('id') _id: string): Promise<User> {

      const session = await this.redisService.getSession(_id);

      if (!accessToken || !_id || session!=accessToken){
        throw new UnauthorizedException('UUID and accessToeken are required');
      }

      return this.authService.getUserByUUID(_id);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubLogin() {
    console.log("github auth")
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(
    @Req() req: Request, 
    @Res() res: Response
  ): Promise<void> {
    const oAuthUser = req.user;
    const tokens = await this.authService.validateOAuthUser(oAuthUser);
    
    const redirectUrl = new URL('http://localhost:3001/');
    redirectUrl.searchParams.append('accessToken', tokens.accessToken);
    redirectUrl.searchParams.append('refreshToken', tokens.refreshToken);
    redirectUrl.searchParams.append('id', tokens.id);

    res.redirect(redirectUrl.toString());
  }
}
