import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OtpService } from 'src/otp/otp.service';
import { User, UserRole } from 'src/users/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TechniciansService } from 'src/technicians/technicians.service';
import { CreateTechnicianDto } from 'src/technicians/dto/create-technician.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private techniciansService: TechniciansService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;

      return result;
    }
    return null;
  }

  async register(dto: RegisterDto) {
    const hashed = await bcrypt.hash(dto.password, 10);

    const userData = new User();
    userData.email = dto.email;
    userData.fullName = dto.fullName;
    userData.role = dto.role;
    userData.password = hashed;
    userData.isActive = true;

    if (userData.role === UserRole.TECHNICIAN) {
      const technicianData = new CreateTechnicianDto();
      technicianData.user = userData;
      const technician = await this.techniciansService.create(technicianData);
      const tokens = await this.getTokens(
        technician.user.id,
        technician.user.role,
      );
      await this.updateRefreshToken(technician.user.id, tokens.refresh_token);
      return tokens;
    } else {
      const user = await this.usersService.create(userData);
      const tokens = await this.getTokens(user.id, user.role);
      await this.updateRefreshToken(user.id, tokens.refresh_token);
      return tokens;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.getTokens(user.id, user.role);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.role);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  async getTokens(userId: number, role: string) {
    const payload = { sub: userId, role };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      }),
    ]);

    return { access_token, refresh_token };
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateUser(userId, { refreshToken: hashed });
  }

  async logout(userId: number) {
    return await this.usersService.updateUser(userId, {
      refreshToken: undefined,
    });
  }

  async sendOtp(phone: string): Promise<string> {
    await this.otpService.generateOtp(phone);

    return 'OTP sent successfully';
  }

  async verifyOtp(
    phone: string,
    code: string,
  ): Promise<{ access_token: string }> {
    const valid = await this.otpService.verifyOtp(phone, code);
    if (!valid) throw new UnauthorizedException('Invalid or expired OTP');

    const user = await this.usersService.findOrCreateByPhone(phone);
    const payload = { sub: user.id, phone: user.phone };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }
}
