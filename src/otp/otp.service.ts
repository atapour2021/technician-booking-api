import {
  BadRequestException,
  Injectable,
  // InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { MoreThan, Repository } from 'typeorm';
import { Otp } from './otp.entity';
import * as bcrypt from 'bcrypt';
// import axios from 'axios';

@Injectable()
export class OtpService {
  // private readonly apiKey =
  //   '79694276594E724E532F64362F442B66336D4A436B6B4667694E31534C5363714D6E577A6F554B754C31553D';

  constructor(
    @InjectRepository(Otp)
    private otpRepo: Repository<Otp>,
  ) {}

  // async sendOtp(phoneNumber: string, otp: string): Promise<void> {
  //   const url = `https://api.kavenegar.com/v1/${this.apiKey}/verify/lookup.json`;

  //   try {
  //     await axios.get(url, {
  //       params: {
  //         receptor: phoneNumber,
  //         token: otp,
  //       },
  //     });
  //   } catch (error) {
  //     console.error(
  //       'Kavenegar OTP sending failed:',
  //       error.response?.data || error.message,
  //     );
  //     throw new InternalServerErrorException('Failed to send OTP.');
  //   }
  // }

  async generateOtp(phone: string): Promise<string> {
    const exceeded = await this.hasExceededOtpLimit(phone);
    if (exceeded) {
      throw new BadRequestException(
        'Too many OTP requests. Please try again later.',
      );
    }

    const code = this.generateRandomOtp();
    const hashedCode = await bcrypt.hash(code, 10);

    const otp = this.otpRepo.create({
      phone,
      code: hashedCode,
      expiresAt: dayjs().add(2, 'minute').toDate(),
    });

    await this.otpRepo.save(otp);

    // await this.sendOtp(phone, code);

    return code;
  }

  private generateRandomOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
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

  private async hasExceededOtpLimit(phone: string): Promise<boolean> {
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
