import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  generateCustomerDepositEmail,
  generateOwnerDepositEmail,
  type DepositData,
} from '../lib/emails/deposit-notifications';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const previewDir = path.resolve(__dirname, '../preview');
fs.mkdirSync(previewDir, { recursive: true });

const sampleData: DepositData = {
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  puppyName: 'Bella',
  puppySlug: 'bella-french-bulldog-2024',
  depositAmount: 300,
  currency: 'USD',
  paymentProvider: 'stripe',
  reservationId: 'res_test123',
  transactionId: 'txn_test456',
};

const customerHtml = generateCustomerDepositEmail(sampleData);
const ownerHtml = generateOwnerDepositEmail(sampleData);

fs.writeFileSync(path.join(previewDir, 'customer-confirmation.html'), customerHtml);
fs.writeFileSync(path.join(previewDir, 'owner-notification.html'), ownerHtml);

console.log('✅ Preview files generated in ./preview');
