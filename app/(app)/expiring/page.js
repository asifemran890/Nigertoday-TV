"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import { Avatar, EmptyState, FilterPills, PageHeader, SearchBox, StatusBadge } from "@/components/ui";
import ReminderModal from "@/components/ReminderModal";
import RenewModal from "@/components/RenewModal";
import { fmtShort } from "@/lib/dates";
import { matchesQuery, withStatus } from "@/lib/helpers";

const RANGES = {
  all: () => true,
  "1-3": (d) => d >= 0 && d <= 3,
  "4-7": (d) => d >= 4 && d <= 7,
  "8-10": (d) => d >= 8 && d <= 10,
};

export default function ExpiringPage() {
  const { customers } = useStore();
  const [q, setQ] = useState("");
  const [range, setRange] = useState("all");
  const [reminder, setReminder] = useState(null);
  const [renew, setRenew] = useState(null);

  const list = useMemo(
    () =>
      withStatus(customers)
        .filter((c) => c.status.key === "expiring")
        .sort((a, b) => a.status.days - b.status.days),
    [customers]
  );

  const count = (k) => list.filter((c) => RANGES[k](c.status.days)).length;
  const rows = list.filter((c) => RANGES[range](c.status.days) && matchesQuery(c, q));

  if (list.length === 0) {
    return (
      <>
        <PageHeader title="Expiring Soon" subtitle="Nothing expiring in the next 10 days">
          <SearchBox value={q} onChange={setQ} />
        </PageHeader>
        <EmptyState
          icon={<CheckCircle2 size={22} />}
          title="You are all caught up"
          text="No subscriptions expire in the next 10 days. Check back soon."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Expiring Soon"
        subtitle={`${list.length} subscription${list.length === 1 ? "" : "s"} expire within the next 10 days`}
      >
        <SearchBox value={q} onChange={setQ} />
      </PageHeader>

      <FilterPills
        value={range}
        onChange={setRange}
        options={[
          { key: "all", label: "All", count: list.length },
          { key: "1-3", label: "1–3 days", count: count("1-3") },
          { key: "4-7", label: "4–7 days", count: count("4-7") },
          { key: "8-10", label: "8–10 days", count: count("8-10") },
        ]}
      />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Customer</th>
                <th className="th">Phone</th>
                <th className="th">Expires</th>
                <th className="th">Remaining</th>
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
                      <button className="btn-soft btn-sm" onClick={() => setReminder(c)}>
                        <MessageCircle size={13} /> Send Reminder
                      </button>
                      <button className="btn-outline btn-sm" onClick={() => setRenew(c)}>Renew</button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[13px] text-ink-500">
                    No customers match your filters.
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
