import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { CreateUserDto } from 'src/auth-service/user/dto/create-user.dto';
import { TokenPairDto } from './dto/tokenpair.dto';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { AccessTokenGuard, RefreshTokenGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(
    @Req() req: Request,
    @Body() createUserDto: CreateUserDto,
  ): Promise<TokenPairDto | null> {
    return this.authService.signUp(req, createUserDto);
  }

  @Post('signin')
  async signIn(
    @Req() req: Request,
    @Body() authDto: AuthDto,
  ): Promise<TokenPairDto | null> {
    return this.authService.signIn(req, authDto);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshTokens(
    @Req() req: Request,
    @Body() payload: any,
  ): Promise<TokenPairDto | null> {
    const refreshToken = req.user['refreshToken'];
    const uuid = payload['uuid'];
    return this.authService.refreshTokens(uuid, refreshToken);
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  logOut(@Req() req: Request) {
    this.authService.logOut(req.user['sub']);
  }
}
