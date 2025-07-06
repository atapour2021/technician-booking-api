import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser, CurrentUserDto } from 'src/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from 'src/users/users.service';
import { ProfileService } from './profile.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private usersService: UsersService,
    private profileService: ProfileService,
  ) {}

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: CurrentUserDto) {
    return await this.usersService.findById(user.userId);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiOperation({ summary: 'update profile' })
  async updateProfile(
    @CurrentUser() user: CurrentUserDto,
    @Body() dto: UpdateProfileDto,
  ) {
    return await this.profileService.updateProfile(user.userId, dto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('upload-avatar')
  @ApiOperation({ summary: 'upload avatar profile' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
      limits: { fileSize: 1_000_000 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new Error('Only images allowed!'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadAvatar(
    @CurrentUser() user: CurrentUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    await this.usersService.updateUser(user.userId, { avatarUrl });
    return { avatarUrl };
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get profile avatar' })
  @UseGuards(JwtAuthGuard)
  @Get(':id/avatar')
  @ApiParam({ name: 'id', example: 1 })
  async getAvatar(@Param('id') id: string, @Res() res: Response) {
    const filePath = await this.profileService.getProfileImage(+id);
    return res.sendFile(filePath);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Delete('avatar')
  @ApiOperation({ summary: 'Delete user avatar' })
  async deleteAvatar(@CurrentUser() user: CurrentUserDto) {
    await this.profileService.deleteAvatar(user.userId);
    return { message: 'Avatar deleted' };
  }
}
