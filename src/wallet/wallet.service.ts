import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import {
  WalletTransaction,
  WalletTransactionType,
} from './entity/wallet-transaction.entity';
import { Wallet } from './entity/wallet.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,

    @InjectRepository(WalletTransaction)
    private txRepo: Repository<WalletTransaction>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getWalletByUserId(userId: number): Promise<Wallet> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['wallet'],
    });
    if (!user?.wallet) {
      throw new NotFoundException('User is not a wallet');
    }
    return user.wallet;
  }

  async createWalletForUser(userId: number): Promise<Wallet> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['wallet'],
    });
    if (!user) throw new NotFoundException('User not found');
    const wallet = this.walletRepo.create({ user });
    const walletData = await this.walletRepo.save(wallet);
    user.wallet = walletData;
    console.log('walletData', walletData);
    await this.userRepo.update({ id: user.id }, user);
    return walletData;
  }

  async deposit(userId: number, amount: number, description?: string) {
    const wallet = await this.getWalletByUserId(userId);
    if (!wallet) throw new BadRequestException();
    if (Array.isArray(wallet)) throw new BadRequestException();
    wallet.balance = +wallet.balance + +amount;
    await this.walletRepo.save(wallet);

    const tx = this.txRepo.create({
      wallet,
      type: WalletTransactionType.DEPOSIT,
      amount,
      description,
    });
    await this.txRepo.save(tx);
    return wallet;
  }

  async withdraw(userId: number, amount: number, description?: string) {
    const wallet = await this.getWalletByUserId(userId);
    if (!wallet) throw new BadRequestException();
    if (Array.isArray(wallet)) throw new BadRequestException();
    if (wallet.balance < amount)
      throw new BadRequestException('Insufficient funds');

    wallet.balance = +wallet.balance - +amount;
    await this.walletRepo.save(wallet);

    const tx = this.txRepo.create({
      wallet,
      type: WalletTransactionType.WITHDRAW,
      amount,
      description,
    });
    await this.txRepo.save(tx);
    return wallet;
  }

  async getTransactions(userId: number): Promise<WalletTransaction[]> {
    const wallet = await this.getWalletByUserId(userId);
    return this.txRepo.find({
      where: { wallet },
      order: { createdAt: 'DESC' },
    });
  }
}
