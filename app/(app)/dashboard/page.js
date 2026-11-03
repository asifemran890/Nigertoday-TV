"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock, MessageCircle, Plus, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { Avatar, PageHeader, SearchBox, StatusBadge } from "@/components/ui";
import ReminderModal from "@/components/ReminderModal";
import { fmtShort, fmtToday } from "@/lib/dates";
import { initials, withStatus } from "@/lib/helpers";

export default function DashboardPage() {
  const { customers, user } = useStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [reminder, setReminder] = useState(null);

  const all = useMemo(() => withStatus(customers), [customers]);
  const active = all.filter((c) => c.status.key === "active");
  const expiring = all.filter((c) => c.status.key === "expiring").sort((a, b) => a.status.days - b.status.days);
  const expired = all.filter((c) => c.status.key === "expired").sort((a, b) => b.status.days - a.status.days);
  const attention = expiring.length + expired.length;
  const needsAttention = [...expired, ...expiring];
  const mobileDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const stats = [
    { label: "Total customers", value: all.length, sub: "All saved customers", icon: Users, iconCls: "bg-slate-100 text-ink-700", valCls: "text-ink-900" },
    { label: "Active", value: active.length, sub: "More than 10 days left", icon: CheckCircle2, iconCls: "bg-emerald-50 text-emerald-600", valCls: "text-emerald-600" },
    { label: "Expiring soon", value: expiring.length, sub: "Within the next 10 days", icon: Clock, iconCls: "bg-amber-50 text-amber-600", valCls: "text-amber-600" },
    { label: "Expired", value: expired.length, sub: "Follow up to renew", icon: AlertTriangle, iconCls: "bg-red-50 text-red-600", valCls: "text-red-600" },
  ];

  return (
    <>
      <div className="-mx-1 -mt-2 lg:mx-0 lg:mt-0">
        <div className="mb-4 flex items-end justify-between lg:hidden">
          <div>
            <p className="text-[10px] font-medium text-ink-500">{mobileDate}</p>
            <h1 className="mt-0.5 text-xl font-bold tracking-tight text-ink-900">Dashboard</h1>
          </div>
          <Link
            href="/settings"
            aria-label={`Account settings for ${user.name}`}
            className="mb-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-[11px] font-semibold text-brand-600"
          >
            {initials(user.name)}
          </Link>
        </div>

        <div className="hidden lg:block">
          <PageHeader title="Dashboard" subtitle={`${fmtToday()} · Here is who needs your attention today`}>
            <SearchBox value={q} onChange={setQ} onSubmit={(v) => v.trim() && router.push(`/customers?q=${encodeURIComponent(v.trim())}`)} />
            <Link href="/customers/new" className="btn-primary">
              <Plus size={15} /> Add Customer
            </Link>
          </PageHeader>

          {attention > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertTriangle size={16} className="text-amber-600" />
              <p className="flex-1 text-[13px] text-amber-800">
                {attention} customer{attention === 1 ? "" : "s"} need your attention — {expiring.length} expire within 10 days and {expired.length} {expired.length === 1 ? "has" : "have"} already expired.
              </p>
              <Link href={expiring.length ? "/expiring" : "/expired"} className="btn-outline btn-sm">
                Review now
              </Link>
            </div>
          )}

          <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="card p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.iconCls}`}>
                      <Icon size={14} />
                    </span>
                    <span className="text-xs font-medium text-ink-500">{s.label}</span>
                  </div>
                  <p className={`text-4xl font-bold ${s.valCls}`}>{s.value}</p>
                  <p className="mt-1 text-[11px] text-ink-500">{s.sub}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="card overflow-hidden lg:col-span-2">
              <div className="px-5 pb-3 pt-4">
                <h2 className="text-sm font-semibold text-ink-900">Expiring Soon</h2>
                <p className="text-[11px] text-ink-500">Sorted by days left</p>
              </div>
              {expiring.length === 0 ? (
                <p className="px-5 pb-6 text-[13px] text-ink-500">Nothing expiring in the next 10 days.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px]">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="th">Customer</th>
                        <th className="th">Expires</th>
                        <th className="th">Remaining</th>
                        <th className="th">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {expiring.slice(0, 5).map((c) => (
                        <tr key={c.id}>
                          <td className="td">
                            <Link href={`/customers/${c.id}`} className="flex items-center gap-2.5 font-medium text-ink-900 hover:text-brand-600">
                              <Avatar name={c.name} /> {c.name}
                            </Link>
                          </td>
                          <td className="td">{fmtShort(c.expiryDate)}</td>
                          <td className="td"><StatusBadge status={c.status} /></td>
                          <td className="td">
                            <button className="btn-soft btn-sm" onClick={() => setReminder(c)}>
                              <MessageCircle size={13} /> Send Reminder
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card p-5">
              <h2 className="text-sm font-semibold text-ink-900">Recently Expired</h2>
              <p className="mb-3 text-[11px] text-ink-500">Renew or follow up</p>
              {expired.length === 0 ? (
                <p className="text-[13px] text-ink-500">No expired subscriptions.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {expired.slice(0, 5).map((c) => (
                    <li key={c.id} className="flex items-center gap-2.5 py-3">
                      <Avatar name={c.name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-ink-900">{c.name}</p>
                        <p className="text-[11px] text-red-600">Expired {c.status.label}</p>
                      </div>
                      <button className="btn-outline btn-sm" onClick={() => setReminder(c)}>Message</button>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/expired" className="mt-3 inline-block text-xs font-medium text-brand-600 hover:underline">
                View all expired →
              </Link>
            </div>
          </div>
        </div>

        <section className="mb-4 lg:hidden">
          {attention > 0 && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2">
              <AlertTriangle size={13} className="shrink-0 text-amber-600" />
              <p className="text-[10px] font-medium text-amber-800">
                {attention} customer{attention === 1 ? "" : "s"} need your attention
              </p>
            </div>
          )}

          <div className="mb-4 grid grid-cols-3 gap-2">
            {[
              { label: "Expired", value: expired.length, cls: "bg-red-50 text-red-600" },
              { label: "Expiring", value: expiring.length, cls: "bg-amber-50 text-amber-600" },
              { label: "Active", value: active.length, cls: "bg-emerald-50 text-emerald-600" },
            ].map((stat) => (
              <div key={stat.label} className={`rounded-lg px-2.5 py-2 ${stat.cls}`}>
                <p className="text-xl font-bold leading-none">{stat.value}</p>
                <p className="mt-1 text-[9px] font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-ink-900">Needs your attention</h2>
            <Link href={expiring.length ? "/expiring" : "/expired"} className="text-[10px] font-medium text-brand-600">
              See all
            </Link>
          </div>

          {needsAttention.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-4 text-center text-[11px] text-ink-500">
              You are all caught up.
            </div>
          ) : (
            <ul className="space-y-2">
              {needsAttention.slice(0, 3).map((customer) => (
                <li key={customer.id} className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-2 py-2 shadow-card">
                  <Avatar name={customer.name} />
                  <Link href={`/customers/${customer.id}`} className="min-w-0 flex-1">
                    <span className="block truncate text-[10px] font-medium text-ink-900">{customer.name}</span>
                    <span className={`mt-0.5 inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                      customer.status.key === "expired" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                    }`}>
                      {customer.status.key === "expired" ? "Expired " : ""}{customer.status.label}
                    </span>
                  </Link>
                  <button
                    onClick={() => setReminder(customer)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-ink-500 hover:bg-brand-50 hover:text-brand-600"
                    aria-label={`Send reminder to ${customer.name}`}
                  >
                    <MessageCircle size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <ReminderModal customer={reminder} onClose={() => setReminder(null)} />
    </>
  );
}
