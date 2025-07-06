import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login and get JWT token' })
  async login(@Body() body: LoginDto) {
    return await this.authService.login(body);
  }

  @Post('logout')
  @ApiOperation({ summary: 'User logout' })
  async logout(@Body() body: LogoutDto) {
    return this.authService.logout(body.userId);
  }

  @Post('register')
  @ApiOperation({ summary: 'User login and get JWT token' })
  async register(@Body() body: RegisterDto) {
    return await this.authService.register(body);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'User refresh and get JWT token' })
  async refresh(@Body() body: RefreshDto) {
    return await this.authService.refreshTokens(
      body.userId,
      body.refresh_token,
    );
  }
}
