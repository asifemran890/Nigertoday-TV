"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { Avatar, EmptyState, PageHeader, SearchBox, StatusBadge } from "@/components/ui";
import ReminderModal from "@/components/ReminderModal";
import RenewModal from "@/components/RenewModal";
import { fmtShort } from "@/lib/dates";
import { matchesQuery, withStatus } from "@/lib/helpers";

export default function ExpiredPage() {
  const { customers } = useStore();
  const [q, setQ] = useState("");
  const [reminder, setReminder] = useState(null);
  const [renew, setRenew] = useState(null);

  const list = useMemo(
    () =>
      withStatus(customers)
        .filter((c) => c.status.key === "expired")
        .sort((a, b) => b.status.days - a.status.days),
    [customers]
  );
  const rows = list.filter((c) => matchesQuery(c, q));

  if (list.length === 0) {
    return (
      <>
        <PageHeader title="Expired" subtitle="No expired subscriptions">
          <SearchBox value={q} onChange={setQ} />
        </PageHeader>
        <EmptyState
          icon={<CheckCircle2 size={22} />}
          title="No expired subscriptions"
          text="Every customer subscription is still active."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Expired"
        subtitle={`${list.length} subscription${list.length === 1 ? " has" : "s have"} expired · Renew them or follow up`}
      >
        <SearchBox value={q} onChange={setQ} />
      </PageHeader>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Customer</th>
                <th className="th">Phone</th>
                <th className="th">Expired on</th>
                <th className="th">Status</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="td">
                    <Link href={`/customers/${c.id}`} className="flex items-center gap-2.5">
                      <Avatar name={c.name} />
                      <span>
                        <span className="block text-[13px] font-medium text-ink-900 hover:text-brand-600">{c.name}</span>
                        <span className="block text-[11px] text-ink-500">{c.email}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="td">{c.phone}</td>
                  <td className="td">{fmtShort(c.expiryDate)}</td>
                  <td className="td"><StatusBadge status={c.status} /></td>
                  <td className="td">
                    <div className="flex gap-2">
                      <button className="btn-primary btn-sm" onClick={() => setRenew(c)}>
                        <RefreshCw size={13} /> Renew
                      </button>
                      <button className="btn-outline btn-sm" onClick={() => setReminder(c)}>Message</button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[13px] text-ink-500">
                    No customers match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReminderModal customer={reminder} onClose={() => setReminder(null)} />
      <RenewModal customer={renew} onClose={() => setRenew(null)} />
    </>
  );
}
