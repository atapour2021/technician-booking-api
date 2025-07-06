import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { Category } from 'src/category/category.entity';

export class CreateServiceDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty()
  @IsInt()
  basePrice: number;
}
