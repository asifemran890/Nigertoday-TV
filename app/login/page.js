"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import { getStatus } from "@/lib/dates";

export default function LoginPage() {
  const { ready, session, customers, login } = useStore();
  const toast = useToast();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && session) router.replace("/dashboard");
  }, [ready, session, router]);

  const stats = customers.reduce(
    (a, c) => {
      const k = getStatus(c).key;
      if (k === "active") a.active++;
      if (k === "expiring") a.expiring++;
      if (k === "expired") a.expired++;
      return a;
    },
    { active: 0, expiring: 0, expired: 0 },
  );

  const submit = (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError("Enter your email or username and password.");
      return;
    }
    const res = login(identifier, password);
    if (!res.ok) return setError(res.error);
    router.replace("/dashboard");
  };

  const cards = [
    { n: stats.active, label: "customers active", color: "text-emerald-600" },
    {
      n: stats.expiring,
      label: "expiring this month",
      color: "text-amber-600",
    },
    { n: stats.expired, label: "expired — follow up", color: "text-red-600" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <section
        className="relative hidden flex-1 flex-col justify-between overflow-hidden p-10 text-white lg:flex"
        style={{
          backgroundImage: `
            linear-gradient(180deg, rgba(15, 23, 42, 0.1), rgba(15, 23, 42, 0.85)),
            url('/banner.jpg'),
            radial-gradient(circle at 30% 20%, #3b4a8f, #111827 70%)
          `,
          backgroundSize: "cover, cover, cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Logo className="h-20 w-20" />
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Know who to call today.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
            Track every customer subscription, see who is expiring, and send
            renewal reminders in one place.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            {cards.map((c) => (
              <div
                key={c.label}
                className="flex w-fit items-center gap-2.5 rounded-xl bg-white px-4 py-2.5 shadow-card"
              >
                <span className={`text-lg font-bold ${c.color}`}>{c.n}</span>
                <span className="text-xs font-medium text-ink-700">
                  {c.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-white/60">
          Private owner dashboard · Works on phone and computer
        </p>
      </section>

      {/* Form */}
      <section className="flex flex-1 items-center justify-center bg-white px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            Welcome back
          </h1>
          <p className="mb-6 mt-1 text-[13px] text-ink-500">
            Log in to manage your customers.
          </p>

          <form onSubmit={submit} noValidate>
            <div className="mb-4">
              <label className="label" htmlFor="id">
                Email or username
              </label>
              <input
                id="id"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="owner@email.com"
                className="input"
              />
            </div>
            <div className="mb-2">
              <label className="label" htmlFor="pw">
                Password
              </label>
              <input
                id="pw"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input"
              />
            </div>
            <div className="mb-5 text-right">
              <button
                type="button"
                onClick={() =>
                  toast.info(
                    "Password reset",
                    "Log in, then change your password from Settings.",
                  )
                }
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            {error && <p className="mb-3 text-xs text-red-600">{error}</p>}
            <button type="submit" className="btn-primary w-full py-2.5">
              Log in
            </button>
          </form>

          <p className="mt-6 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-ink-500">
            Demo login:{" "}
            <span className="font-medium text-ink-700">owner@email.com</span> /{" "}
            <span className="font-medium text-ink-700">admin123</span>
          </p>
        </div>
      </section>
    </div>
  );
}
