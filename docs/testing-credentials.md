# Manual testing credentials

Clerk test values for exercising sign-in/sign-up/sign-out/account-disabled
flows in the browser without sending real email or SMS.

## Email

Any address containing `+clerk_test@`, e.g.:

- `jane+clerk_test@example.com`
- `doe+clerk_test@example.com`

OTP code is always `424242`.

## Phone

Any fictional number in the range `+1 (XXX) 555-0100` to `+1 (XXX) 555-0199`, e.g.:

- `+12015550100`
- `+19735550133`

No SMS is sent. Verification code is always `424242`.
