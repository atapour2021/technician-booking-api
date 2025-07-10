import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { MoreThan, Repository } from 'typeorm';
import { Otp } from './otp.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private otpRepo: Repository<Otp>,
  ) {}

  async generateOtp(phone: string): Promise<string> {
    const exceeded = await this.hasExceededOtpLimit(phone);
    if (exceeded) {
      throw new BadRequestException(
        'Too many OTP requests. Please try again later.',
      );
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedCode = await bcrypt.hash(code, 10);

    const otp = this.otpRepo.create({
      phone,
      code: hashedCode,
      expiresAt: dayjs().add(2, 'minute').toDate(),
    });

    await this.otpRepo.save(otp);

    return code;
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    const otp = await this.otpRepo.findOne({
      where: {
        phone,
        code,
        used: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (!otp) return false;

    const isMatch = await bcrypt.compare(code, otp.code);
    if (!isMatch) return false;

    if (dayjs().isAfter(otp.expiresAt)) return false;

    otp.used = true;
    await this.otpRepo.save(otp);

    return true;
  }

  async hasExceededOtpLimit(phone: string): Promise<boolean> {
    const oneHourAgo = dayjs().subtract(1, 'hour').toDate();

    const count = await this.otpRepo.count({
      where: {
        phone,
        createdAt: MoreThan(oneHourAgo),
      },
    });

    return count >= 10;
  }
}
