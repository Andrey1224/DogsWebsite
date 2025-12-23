import 'dotenv/config';
import { sendCustomerDepositConfirmation } from '../lib/emails/deposit-notifications';
import type { DepositData } from '../lib/emails/deposit-notifications';

async function main() {
  const to = process.env.OWNER_EMAIL!;
  console.log('[Smoke] env', {
    mode: process.env.RESEND_DELIVERY_MODE,
    nodeEnv: process.env.NODE_ENV,
    from: process.env.RESEND_FROM_EMAIL,
    owner: to,
    hasKey: !!process.env.RESEND_API_KEY,
  });

  const payload: DepositData = {
    customerName: 'Test User',
    customerEmail: to,
    puppyName: 'Duddy',
    puppySlug: 'duddy',
    depositAmount: 300,
    currency: 'USD',
    paymentProvider: 'stripe',
    transactionId: 'tx_test',
    reservationId: 'res_test',
  };

  await sendCustomerDepositConfirmation(payload);

  console.log('[Smoke] done');
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
