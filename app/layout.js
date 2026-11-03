import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { ToastProvider } from "@/components/Toast";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "Nigertoday TV — Subscription Manager",
  description:
    "Track customer TV subscriptions, expiry dates and renewal reminders.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <StoreProvider>
          <ToastProvider>{children}</ToastProvider>
          <Analytics />
        </StoreProvider>
      </body>
    </html>
  );
}
