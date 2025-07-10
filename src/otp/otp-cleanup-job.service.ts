import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp } from './otp.entity';
import { Repository, LessThan } from 'typeorm';
import * as dayjs from 'dayjs';

@Injectable()
export class OtpCleanupJob {
  private readonly logger = new Logger(OtpCleanupJob.name);

  constructor(
    @InjectRepository(Otp)
    private otpRepo: Repository<Otp>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCleanup() {
    const now = new Date();

    const result = await this.otpRepo.delete({
      expiresAt: LessThan(now),
    });

    if (result.affected) {
      this.logger.log(`Deleted ${result.affected} expired OTP(s)`);
    }
  }
}
