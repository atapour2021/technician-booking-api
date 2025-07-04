import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  serviceId: number;

  @ApiProperty({ example: '2025-07-10T10:30:00Z' })
  @IsDateString()
  scheduledDate: string;
}
