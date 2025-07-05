import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaymentsService {
  private ZARINPAL_MERCHANT_ID = 'YOUR_MERCHANT_ID';

  async requestPayment(
    amount: number,
    description: string,
    callbackUrl: string,
  ) {
    const response = await axios.post(
      'https://api.zarinpal.com/pg/v4/payment/request.json',
      {
        merchant_id: this.ZARINPAL_MERCHANT_ID,
        amount,
        description,
        callback_url: callbackUrl,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    const { data } = response.data;
    if (data.code === 100) {
      return {
        authority: data.authority,
        url: `https://www.zarinpal.com/pg/StartPay/${data.authority}`,
      };
    } else {
      throw new Error('Payment initiation failed: ' + data.message);
    }
  }

  async verifyPayment(authority: string, amount: number) {
    const response = await axios.post(
      'https://api.zarinpal.com/pg/v4/payment/verify.json',
      {
        merchant_id: this.ZARINPAL_MERCHANT_ID,
        amount,
        authority,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    const { data } = response.data;
    return data;
  }
}
