import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AssignTechnicianDto {
  @ApiProperty({ example: 5 })
  @IsInt()
  technicianId: number;
}
