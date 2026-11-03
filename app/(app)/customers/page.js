"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { Avatar, EmptyState, FilterPills, PageHeader, SearchBox, StatusBadge } from "@/components/ui";
import ReminderModal from "@/components/ReminderModal";
import RenewModal from "@/components/RenewModal";
import { fmtShort } from "@/lib/dates";
import { matchesQuery, withStatus } from "@/lib/helpers";

export default function CustomersPage() {
  const { customers } = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [reminder, setReminder] = useState(null);
  const [renew, setRenew] = useState(null);

  // Pick up ?q= from the dashboard search.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("q");
    if (p) setQ(p);
  }, []);

  const all = useMemo(() => withStatus(customers), [customers]);
  const counts = {
    all: all.length,
    active: all.filter((c) => c.status.key === "active").length,
    expiring: all.filter((c) => c.status.key === "expiring").length,
    expired: all.filter((c) => c.status.key === "expired").length,
  };
  const rows = all.filter((c) => (filter === "all" || c.status.key === filter) && matchesQuery(c, q));

  const addBtn = (
    <Link href="/customers/new" className="btn-primary">
      <Plus size={15} /> Add Customer
    </Link>
  );

  if (all.length === 0) {
    return (
      <>
        <PageHeader title="Customers" subtitle="0 customers">
          <SearchBox value={q} onChange={setQ} />
        </PageHeader>
        <EmptyState
          tone="brand"
          icon={<Users size={22} />}
          title="No customers yet"
          text="Add your first customer to start tracking subscriptions and expiry dates."
          action={addBtn}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Customers" subtitle={`${all.length} customers · Manage subscriptions and renewals`}>
        <SearchBox value={q} onChange={setQ} />
        {addBtn}
      </PageHeader>

      <FilterPills
        value={filter}
        onChange={setFilter}
        options={[
          { key: "all", label: "All", count: counts.all },
          { key: "active", label: "Active", count: counts.active },
          { key: "expiring", label: "Expiring soon", count: counts.expiring },
          { key: "expired", label: "Expired", count: counts.expired },
        ]}
      />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-0 lg:min-w-[860px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Customer</th>
                <th className="th hidden lg:table-cell">Phone</th>
                <th className="th hidden lg:table-cell">Start date</th>
                <th className="th hidden lg:table-cell">Duration</th>
                <th className="th hidden lg:table-cell">Expires</th>
                <th className="th">Status</th>
                <th className="th hidden lg:table-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((c) => {
                const expired = c.status.key === "expired";
                const renewBtn = (
                  <button className={expired ? "btn-primary btn-sm" : "btn-outline btn-sm"} onClick={() => setRenew(c)}>
                    Renew
                  </button>
                );
                const msgBtn = (
                  <button className={expired ? "btn-outline btn-sm" : "btn-soft btn-sm"} onClick={() => setReminder(c)}>
                    Message
                  </button>
                );
                return (
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
                    <td className="td hidden lg:table-cell">{c.phone}</td>
                    <td className="td hidden lg:table-cell">{fmtShort(c.startDate)}</td>
                    <td className="td hidden lg:table-cell">{c.durationMonths} mo</td>
                    <td className="td hidden lg:table-cell">{fmtShort(c.expiryDate)}</td>
                    <td className="td"><StatusBadge status={c.status} /></td>
                    <td className="td hidden lg:table-cell">
                      <div className="flex gap-2">
                        {expired ? <>{renewBtn}{msgBtn}</> : <>{msgBtn}{renewBtn}</>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[13px] text-ink-500">
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
