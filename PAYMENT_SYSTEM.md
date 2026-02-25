# 💳 Payment System Documentation

Dokumentasi lengkap sistem pembayaran dan subscription untuk Capsule Platform.

## 🎯 Overview

Sistem pembayaran dirancang untuk mendukung:
- **Multiple Subscription Plans** (Free, Premium, Pro)
- **Payment Gateway Integration** (siap untuk Midtrans/Xendit)
- **Automatic Payment Verification**
- **Invoice Generation**
- **Payment History Tracking**
- **Expired Payment Handling**

---

## 📊 Database Schema

### Payment Model
```prisma
model Payment {
  id              Int      @id @default(autoincrement())
  userId          String
  planId          Int
  amountCents     Int
  status          String   // pending, completed, failed, expired
  paymentMethod   String   // bank_transfer, e_wallet, qris, free
  paymentGateway  String   // manual, midtrans, xendit
  externalId      String?  @unique
  externalUrl     String?
  expiredAt       DateTime?
  paidAt          DateTime?
  metadata        String?  // JSON
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User     @relation(...)
  plan            Plan     @relation(...)
  invoices        Invoice[]
}
```

### Invoice Model
```prisma
model Invoice {
  id              Int      @id @default(autoincrement())
  invoiceNumber   String   @unique
  userId          String
  paymentId       Int
  planId          Int
  amountCents     Int
  status          String   // unpaid, paid, cancelled
  dueDate         DateTime
  paidAt          DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User     @relation(...)
  payment         Payment  @relation(...)
  plan            Plan     @relation(...)
}
```

---

## 🔄 Payment Flow

### 1. User Selects Plan
**Route:** `/subscription` or `/plans` (public)

User can:
- View all available plans
- See current plan status
- Choose new plan to upgrade/downgrade

### 2. Checkout Page
**Route:** `/subscription/checkout/[slug]`

Features:
- Plan summary with features list
- Pricing breakdown
- Payment method selection (Bank Transfer, E-Wallet, QRIS)
- User info display

### 3. Payment Creation
**API:** `POST /api/payment/create`

```typescript
// Request
{
  planId: number,
  paymentMethod: "bank_transfer" | "e_wallet" | "qris"
}

// Response (Free Plan)
{
  success: true,
  paymentId: "payment_id",
  message: "Berhasil switch ke free plan"
}

// Response (Paid Plan)
{
  success: true,
  paymentId: "payment_id",
  externalId: "PAY-1234567890-ABCD1234",
  paymentUrl: "https://payment-gateway.com/pay/...",
  expiresAt: "2024-02-26T10:00:00.000Z"
}
```

**Process:**
- ✅ Validate user session
- ✅ Check plan exists and is active
- ✅ Verify user doesn't already have the plan
- **Free Plan:**
  - Update `user.planId` immediately
  - Create completed payment record
  - Generate paid invoice
  - Return success
- **Paid Plan:**
  - Create pending payment with 24h expiration
  - Generate unique `externalId`
  - Create `externalUrl` (from payment gateway)
  - Generate unpaid invoice
  - Return payment URL for redirect

### 4. Payment Gateway (Pending Page)
**Route:** `/subscription/payment/pending?paymentId=PAY-XXX`

Features:
- Display payment details (amount, method, expiry)
- Show payment instructions
- **Testing Mode:** Simulate payment success/failure
- Check expiration status
- Redirect to retry if expired

**Real Production Flow:**
- User redirected to actual payment gateway (Midtrans/Xendit)
- User completes payment
- Gateway sends webhook to `/api/payment/webhook`

### 5. Payment Webhook
**API:** `POST /api/payment/webhook`

```typescript
// Webhook Payload (from payment gateway)
{
  external_id: "PAY-1234567890-ABCD1234",
  status: "PAID" | "FAILED" | "EXPIRED",
  payment_method: "bank_transfer",
  paid_at: "2024-02-25T12:00:00.000Z"
}
```

**Process:**
- ✅ Verify webhook signature (implement per gateway docs)
- ✅ Find payment by `externalId`
- ✅ Check if already processed
- ✅ Update payment status
- **On Success (`status: "PAID"`):**
  - Update `payment.status = "completed"`
  - Update `payment.paidAt`
  - Update `user.planId` to new plan
  - Update `invoice.status = "paid"`
  - Update `invoice.paidAt`
  - Log success

### 6. Payment Success/Failure Pages
**Success:** `/subscription/payment/success?paymentId=xxx`
**Failure:** `/subscription/payment/failed?paymentId=xxx`

**Success Page:**
- ✅ Check icon + confirmation message
- Payment details (plan, amount, invoice number)
- Payment method and status badge
- Links to dashboard and payment history

**Failure Page:**
- ❌ Error icon + failure message
- Possible causes list
- Retry button (redirect to checkout)
- Support link

### 7. Payment History
**Route:** `/subscription/payments`

Features:
- List all user payments (ordered by date desc)
- Payment cards showing:
  - Plan name, amount, date
  - Payment method and invoice number
  - Status badge (completed/pending/failed/expired)
  - Paid date (if completed)
  - Expiry info (if pending)
  - Action buttons:
    - "Bayar Sekarang" if pending & not expired
    - "Coba Lagi" if failed/expired
- Empty state with CTA to view plans

---

## ⚙️ Backend Processes

### Payment Verification Cron Job
**API:** `GET /api/payment/verify`
**Schedule:** Every 1 hour (configured in `vercel.json`)

```json
{
  "crons": [
    {
      "path": "/api/payment/verify",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Process:**
- Find all pending payments where `expiredAt < now()`
- Update `payment.status = "expired"`
- Update related invoices `status = "cancelled"`
- Log expired count

**Security:**
- Optional `CRON_SECRET` environment variable
- Must pass `Authorization: Bearer <CRON_SECRET>` header

---

## 🔐 Security Considerations

### 1. Webhook Signature Verification
**Todo:** Implement signature verification based on payment gateway

```typescript
// Example for Midtrans
const crypto = require('crypto');
const signature = req.headers.get('x-signature');
const payload = JSON.stringify(body);
const expectedSignature = crypto
  .createHmac('sha512', process.env.PAYMENT_SECRET)
  .update(payload)
  .digest('hex');

if (signature !== expectedSignature) {
  return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
}
```

### 2. CRON_SECRET for Verify Endpoint
Add to `.env`:
```env
CRON_SECRET=your-random-secret-key-here
```

### 3. User Authentication
All payment routes require valid session:
```typescript
const user = await getSessionUser();
if (!user) {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}
```

---

## 🚀 Integration with Payment Gateways

### Midtrans Integration

1. **Install SDK:**
```bash
npm install midtrans-client
```

2. **Initialize Client:**
```typescript
import midtransClient from 'midtrans-client';

const snap = new midtransClient.Snap({
  isProduction: process.env.NODE_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});
```

3. **Create Transaction:**
```typescript
const parameter = {
  transaction_details: {
    order_id: externalId,
    gross_amount: plan.priceCents / 100, // Convert cents to rupiah
  },
  customer_details: {
    first_name: user.name,
    email: user.email,
  },
  enabled_payments: [
    paymentMethod === 'bank_transfer' ? 'bank_transfer' : 
    paymentMethod === 'e_wallet' ? 'gopay' : 'qris'
  ],
};

const transaction = await snap.createTransaction(parameter);
const externalUrl = transaction.redirect_url;
```

4. **Update Webhook Handler:**
```typescript
// Midtrans sends POST to /api/payment/webhook
const { order_id, transaction_status } = body;

let status = 'pending';
if (transaction_status === 'settlement' || transaction_status === 'capture') {
  status = 'completed';
} else if (transaction_status === 'deny' || transaction_status === 'cancel') {
  status = 'failed';
} else if (transaction_status === 'expire') {
  status = 'expired';
}
```

### Xendit Integration

1. **Install SDK:**
```bash
npm install xendit-node
```

2. **Initialize Client:**
```typescript
import Xendit from 'xendit-node';

const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY
});
```

3. **Create Invoice:**
```typescript
const { Invoice } = xendit;
const invoice = new Invoice({});

const invoiceData = await invoice.createInvoice({
  externalId: externalId,
  amount: plan.priceCents / 100,
  payerEmail: user.email,
  description: `Subscription - ${plan.name}`,
  paymentMethods: [
    paymentMethod === 'bank_transfer' ? 'BANK_TRANSFER' :
    paymentMethod === 'e_wallet' ? 'EWALLET' : 'QR_CODE'
  ]
});

const externalUrl = invoiceData.invoice_url;
```

4. **Update Webhook Handler:**
```typescript
// Xendit sends POST to /api/payment/webhook
const { external_id, status: xenditStatus } = body;

let status = 'pending';
if (xenditStatus === 'PAID') {
  status = 'completed';
} else if (xenditStatus === 'EXPIRED') {
  status = 'expired';
}
```

---

## 📝 Environment Variables

Add to `.env`:

```env
# Base URL
BASE_URL=http://localhost:3000

# Midtrans (Optional)
MIDTRANS_SERVER_KEY=your-server-key
MIDTRANS_CLIENT_KEY=your-client-key

# Xendit (Optional)
XENDIT_SECRET_KEY=your-secret-key

# Cron Security
CRON_SECRET=your-random-secret
```

---

## 🧪 Testing

### Manual Testing Flow

1. **Free Plan Upgrade:**
   - Login as user with paid plan
   - Go to `/subscription`
   - Click "Switch to Free" on Free plan card
   - Should instantly upgrade + redirect to success page

2. **Paid Plan Upgrade:**
   - Login as user
   - Go to `/subscription`
   - Click "Upgrade Sekarang" on Premium/Pro plan
   - Fill checkout form, select payment method
   - Click "Lanjutkan Pembayaran"
   - Redirected to pending page with simulated payment
   - Click "✅ Simulasi Pembayaran Berhasil"
   - Should redirect to success page
   - Verify user plan updated in database

3. **Expired Payment:**
   - Create payment with past `expiredAt` date
   - Run cron job: `curl http://localhost:3000/api/payment/verify`
   - Check payment status updated to "expired"
   - Check invoice status updated to "cancelled"

4. **Payment History:**
   - Go to `/subscription/payments`
   - Should see all payments with correct status
   - Test "Bayar Sekarang" / "Coba Lagi" buttons

### Automated Tests (Todo)

```typescript
// Example Jest test
describe('Payment System', () => {
  it('should create free plan payment and upgrade immediately', async () => {
    const response = await createPayment(userId, freePlanId, 'free');
    expect(response.success).toBe(true);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user.planId).toBe(freePlanId);
  });

  it('should create pending payment for paid plan', async () => {
    const response = await createPayment(userId, premiumPlanId, 'bank_transfer');
    expect(response.paymentUrl).toBeDefined();
    const payment = await prisma.payment.findUnique({ 
      where: { id: response.paymentId } 
    });
    expect(payment.status).toBe('pending');
  });

  it('should process webhook and upgrade user plan', async () => {
    const payment = await createPendingPayment();
    await processWebhook({
      external_id: payment.externalId,
      status: 'PAID'
    });
    const updatedPayment = await prisma.payment.findUnique({ 
      where: { id: payment.id } 
    });
    expect(updatedPayment.status).toBe('completed');
  });
});
```

---

## 🎨 UI Components & Styling

All payment UI uses CSS classes defined in `globals.css`:

- `.subscription-page` - Main subscription page container
- `.current-plan-banner` - Active plan display
- `.modern-plans-grid` - Plans grid layout
- `.checkout-container` - Checkout page layout
- `.payment-method-option` - Payment method selector
- `.payment-success-container` - Success page
- `.payment-failed-container` - Failure page
- `.payment-history-container` - History page
- `.status-badge` - Status indicators with colors

---

## 📚 API Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/payment/create` | POST | ✅ | Create new payment |
| `/api/payment/webhook` | POST | ❌ | Receive gateway webhook |
| `/api/payment/webhook` | GET | ✅ | Manual payment verification |
| `/api/payment/verify` | GET | ⚠️ | Cron job to expire payments |

---

## 🛠️ Troubleshooting

### Payment not updating after webhook
- Check webhook URL is whitelisted in payment gateway
- Verify `externalId` matches between payment and webhook payload
- Check server logs for webhook errors
- Test webhook manually with curl/Postman

### User plan not upgrading
- Check payment status is "completed"
- Verify `user.planId` updated after webhook
- Check database transaction committed
- Look for errors in server logs

### Expired payments not cleaning up
- Verify cron job is running (check Vercel logs)
- Test `/api/payment/verify` endpoint manually
- Check `CRON_SECRET` if using authentication
- Ensure `expiredAt` dates are set correctly

---

## 🔮 Future Enhancements

- [ ] Refund support
- [ ] Proration for plan downgrades
- [ ] Recurring billing automation
- [ ] Payment retry logic for failed payments
- [ ] Email notifications for payment events
- [ ] PDF invoice generation
- [ ] Multiple payment methods per user
- [ ] Discounts/coupon codes
- [ ] Payment analytics dashboard
- [ ] Subscription pause/resume

---

## 📞 Support

For payment-related issues:
1. Check payment history at `/subscription/payments`
2. Verify payment status in database
3. Review server logs for errors
4. Contact support with payment ID

---

**Last Updated:** February 2024  
**Version:** 1.0.0
