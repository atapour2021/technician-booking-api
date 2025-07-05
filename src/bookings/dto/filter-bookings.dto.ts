import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsInt, Min, IsDateString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PaymentStatus } from '../booking.entity';
import { PaginationDto } from 'src/common';

export class FilterBookingsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ description: 'Technician user ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  technicianId?: number;

  @ApiPropertyOptional({ description: 'Start date (ISO)' })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (ISO)' })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
  @IsDateString()
  endDate?: string;
}
