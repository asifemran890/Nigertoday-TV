"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock, MessageCircle, Plus, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { Avatar, PageHeader, SearchBox, StatusBadge } from "@/components/ui";
import ReminderModal from "@/components/ReminderModal";
import { fmtShort, fmtToday } from "@/lib/dates";
import { withStatus } from "@/lib/helpers";

export default function DashboardPage() {
  const { customers } = useStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [reminder, setReminder] = useState(null);

  const all = useMemo(() => withStatus(customers), [customers]);
  const active = all.filter((c) => c.status.key === "active");
  const expiring = all.filter((c) => c.status.key === "expiring").sort((a, b) => a.status.days - b.status.days);
  const expired = all.filter((c) => c.status.key === "expired").sort((a, b) => b.status.days - a.status.days);
  const attention = expiring.length + expired.length;

  const stats = [
    { label: "Total customers", value: all.length, sub: "All saved customers", icon: Users, iconCls: "bg-slate-100 text-ink-700", valCls: "text-ink-900" },
    { label: "Active", value: active.length, sub: "More than 10 days left", icon: CheckCircle2, iconCls: "bg-emerald-50 text-emerald-600", valCls: "text-emerald-600" },
    { label: "Expiring soon", value: expiring.length, sub: "Within the next 10 days", icon: Clock, iconCls: "bg-amber-50 text-amber-600", valCls: "text-amber-600" },
    { label: "Expired", value: expired.length, sub: "Follow up to renew", icon: AlertTriangle, iconCls: "bg-red-50 text-red-600", valCls: "text-red-600" },
  ];

  return (
    <>
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

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <ReminderModal customer={reminder} onClose={() => setReminder(null)} />
    </>
  );
}
