# Chatpesa.online

Chatpesa.online is a TanStack Start app with:

- Supabase/Postgres persistence for users, activation payments, withdrawals, notifications and chat payouts.
- TZS 16,000 activation fee.
- FimiPay Tanzania mobile payment using the documented `create_order` and `order_status` endpoints. Successful FimiPay payments activate the account automatically.
- Lipa Namba `251161660` / `ASSERT BRIDGE` manual verification flow.
- User registration with a unique Username + Password login.
- Realistic scripted conversation flows for the listed chat profiles. The conversation is limited internally to exactly 20 visible messages and does not display a countdown.
- Completed chat payout popup showing the payout and that the money is in Balance. The popup can be dismissed.
- Withdrawal module with a minimum of TZS 100,000; admin approve/reject and user notifications.
- Admin panel for activation deposit approve/reject, withdrawal approve/reject, and notifications to everyone or one user.
- User notification dismiss button.
- 20-minute login session expiry. After expiry, the user must log in again.

## Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in Supabase SQL Editor. The script includes a safe migration for the Username column.
3. Add the Vercel environment variables from `.env.example`.
4. Keep `SUPABASE_SERVICE_ROLE_KEY` and `FIMIPAY_API_KEY` server-side only. Do not expose them as `VITE_*` variables.
5. Use a strong `SESSION_SECRET`, plus `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
6. FimiPay endpoints used by the app:
   - `POST https://fimipay.com/api/v1/payment/create_order`
   - `POST https://fimipay.com/api/v1/payment/order_status`
7. Build with `bun run build`.

## Payment details

- Activation fee: TZS 16,000
- Lipa Namba: 251161660
- Business name: ASSERT BRIDGE
- Manual flow: user pays -> enters the phone used for payment -> NIMELIPIA -> admin reviews -> approve activates the account.
- FimiPay flow: user starts payment -> FimiPay sends the Tanzania mobile-money prompt -> order status is polled -> successful payment activates the account automatically.
