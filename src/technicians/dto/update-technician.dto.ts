import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ServiceArea } from '../entity/service-area.entity';
import { Skill } from '../entity/skill.entity';
import { Document } from '../entity/document.entity';

export class UpdateTechnicianDto {
  @ApiProperty({ type: [Skill] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Skill)
  skills: Skill[];

  @ApiProperty({ type: [ServiceArea] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceArea)
  serviceAreas: ServiceArea[];

  @ApiProperty({ type: [Document] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Document)
  documents: Document[];
}
