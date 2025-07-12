import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { WalletTransaction } from './entity/wallet-transaction.entity';
import { Wallet } from './entity/wallet.entity';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([WalletTransaction]),
  ],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
