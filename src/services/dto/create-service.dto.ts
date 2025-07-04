import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  category: string;

  @ApiProperty()
  @IsInt()
  basePrice: number;
}
