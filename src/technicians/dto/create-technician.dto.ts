import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class SkillDto {
  @ApiProperty()
  @IsString()
  title: string;
}

class AreaDto {
  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  district: string;
}

class DocumentDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  fileUrl: string;
}

export class CreateTechnicianDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills: SkillDto[];

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AreaDto)
  serviceAreas: AreaDto[];

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents: DocumentDto[];
}
