import { Test, TestingModule } from '@nestjs/testing';
import { OtpCleanupJobService } from './otp-cleanup-job.service';

describe('OtpCleanupJobService', () => {
  let service: OtpCleanupJobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OtpCleanupJobService],
    }).compile();

    service = module.get<OtpCleanupJobService>(OtpCleanupJobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
