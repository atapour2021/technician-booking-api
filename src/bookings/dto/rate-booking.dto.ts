import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min, IsOptional } from 'class-validator';

export class RateBookingDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ required: false })
  @IsOptional()
  comment?: string;
}
