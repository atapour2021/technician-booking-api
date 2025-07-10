import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

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
  @ApiOperation({ summary: 'User register and get JWT token' })
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

  @Post('send-otp')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto.phone);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.phone, dto.otp);
  }
}
