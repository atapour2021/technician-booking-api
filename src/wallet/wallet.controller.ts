import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles, RolesGuard } from 'src/common';
import { UserRole } from 'src/users/user.entity';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { WalletService } from './wallet.service';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async getMyWallet(@Req() req) {
    return await this.walletService.getWalletByUserId(req.user.id);
  }

  @Post('create-wallet')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createWallet(@Req() req) {
    return await this.walletService.createWalletForUser(req.user.id);
  }

  @Post('deposit')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async deposit(@Req() req, @Body() body: DepositDto) {
    return await this.walletService.deposit(
      req.user.id,
      body.amount,
      body.description,
    );
  }

  @Post('withdraw')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async withdraw(@Req() req, @Body() body: WithdrawDto) {
    return await this.walletService.withdraw(
      req.user.id,
      body.amount,
      body.description,
    );
  }

  @Get('transactions')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async transactions(@Req() req) {
    return await this.walletService.getTransactions(req.user.id);
  }
}
