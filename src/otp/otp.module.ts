import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './otp.entity';
import { OtpService } from './otp.service';
import { ScheduleModule } from '@nestjs/schedule';
import { OtpCleanupJob } from './otp-cleanup-job.service';

@Module({
  imports: [TypeOrmModule.forFeature([Otp]), ScheduleModule.forRoot()],
  providers: [OtpService, OtpCleanupJob],
  exports: [OtpService],
})
export class OtpModule {}
