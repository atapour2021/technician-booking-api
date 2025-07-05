import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  page: number = 1;

  @ApiPropertyOptional({ default: 10, maximum: 100 })
  @Type(() => Number)
  @IsOptional()
  @Min(1)
  @Max(100)
  limit: number = 10;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}
