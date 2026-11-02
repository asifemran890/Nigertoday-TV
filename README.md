# Nigertoday TV — Subscription Manager

Next.js 14 (App Router, JavaScript) + Tailwind CSS. Tracks customer TV subscriptions, expiry dates and renewal reminders.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

Demo login: `owner@email.com` (or `owner`) / `admin123`

## Screens

Login · Dashboard · Customers (filters, search) · Add Customer · Customer Details (renewal history) · Expiring Soon · Expired · Settings, plus Renew, Send Reminder, Delete and Change Password modals, success/error toasts and empty states.

## Notes

- Data is stored in the browser (`localStorage`) and seeded with 30 demo customers (24 active, 4 expiring, 2 expired) relative to today. To reset, clear site data. Swap `lib/store.js` for API calls when you add a backend.
- "Expiring soon" means within 10 days (`EXPIRING_WINDOW_DAYS` in `lib/dates.js`).
- Renewing extends from the current expiry (or from today if already expired).
- Branding: `components/Logo.js` is a placeholder. Put your real logo at `public/logo.png` and swap the component body for an `<img>`. For the login panel photo, add `public/brand-bg.jpg`.
- Passwords are stored in plain text in localStorage for this demo — use real authentication before going live.
