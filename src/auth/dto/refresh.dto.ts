import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RefreshDto {
  @ApiProperty()
  userId: number;

  @IsNotEmpty()
  @ApiProperty()
  refresh_token: string;
}
