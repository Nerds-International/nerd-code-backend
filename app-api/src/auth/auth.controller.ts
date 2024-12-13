import { 
  Body, 
  Controller, 
  Get, 
  Post, 
  Req, 
  Res, 
  UseGuards 
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { TokenPairDto } from './dto/tokenpair.dto';
import { AuthDto } from './dto/auth.dto';
import { AccessTokenGuard, RefreshTokenGuard } from './guards';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    const { uuid, refreshToken } = req.body;
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

    res.redirect(
      `http://localhost:3001/`
    );
  }
}
