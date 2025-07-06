import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FilterQuery, Roles, RolesGuard } from 'src/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilterUserDto } from './dto/filter.user.dto';
import { User, UserRole } from './user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users (for dev/test only)' })
  @ApiResponse({ status: 200, description: 'All users returned', type: [User] })
  getAll() {
    return this.usersService.findAll();
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current logged-in user' })
  @ApiResponse({
    status: 200,
    description: 'Authenticated user returned',
    type: User,
  })
  getProfile(@Request() req) {
    return req.user;
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'User toggle status' })
  async toggleStatus(@Param('id') id: string) {
    const user = await this.usersService.findById(+id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.usersService.updateUser(+id, {
      isActive: !user.isActive,
    });
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  async deleteUser(@Param('id') id: string) {
    return await this.usersService.deleteUser(+id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/role')
  @ApiOperation({ summary: 'Change user role' })
  async changeRole(@Param('id') id: string, @Body() body: { role: UserRole }) {
    return await this.usersService.updateUser(+id, { role: body.role });
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/users')
  @ApiOperation({ summary: 'Admin: List users with filters and pagination' })
  @ApiQuery({
    type: FilterUserDto,
  })
  async getPayments(@FilterQuery(FilterUserDto) filter: FilterUserDto) {
    return this.usersService.findAllWithFilter(filter);
  }
}
