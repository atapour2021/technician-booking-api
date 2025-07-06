import { Injectable } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProfileService {
  constructor(private usersService: UsersService) {}

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const updateData = new User();

    if (dto.name) updateData.fullName = dto.name;
    if (dto.password) {
      const hashed = await bcrypt.hash(dto.password, 10);
      updateData.password = hashed;
    }

    await this.usersService.updateUser(userId, updateData);
    return this.usersService.findById(userId);
  }
}
