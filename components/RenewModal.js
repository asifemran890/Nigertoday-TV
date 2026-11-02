"use client";

import { useEffect, useState } from "react";
import { Check, RefreshCw } from "lucide-react";
import Modal from "./Modal";
import { StatusBadge } from "./ui";
import { useStore } from "@/lib/store";
import { useToast } from "./Toast";
import { addMonths, daysBetween, fmtFull, getStatus, todayISO } from "@/lib/dates";

const OPTIONS = [3, 6, 12];

export default function RenewModal({ customer, onClose }) {
  const { renewCustomer } = useStore();
  const toast = useToast();
  const [months, setMonths] = useState(3);

  useEffect(() => {
    if (customer) setMonths(3);
  }, [customer]);

  if (!customer) return null;

  const status = getStatus(customer);
  const from = daysBetween(todayISO(), customer.expiryDate) >= 0 ? customer.expiryDate : todayISO();
  const newExpiry = addMonths(from, months);

  const confirm = () => {
    renewCustomer(customer.id, months);
    toast.success("Subscription renewed", `${customer.name} · new expiry ${fmtFull(newExpiry)}`);
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      icon={<RefreshCw size={18} />}
      title="Renew subscription"
      subtitle={customer.name}
    >
      <div className="mb-4 flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-3">
        <div>
          <p className="text-[11px] text-ink-500">Current expiry</p>
          <p className="text-[13px] font-semibold text-ink-900">{fmtFull(customer.expiryDate)}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <p className="label">Renewal duration</p>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {OPTIONS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMonths(m)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-[13px] font-medium ${
              months === m ? "border-brand-600 bg-brand-50 text-ink-900" : "border-slate-200 text-ink-700 hover:bg-slate-50"
            }`}
          >
            <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${months === m ? "border-brand-600" : "border-slate-300"}`}>
              {months === m && <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />}
            </span>
            {m} months
          </button>
        ))}
      </div>

      <div className="mb-3 rounded-lg bg-brand-50 px-3.5 py-3">
        <p className="text-[11px] text-ink-500">New expiration date</p>
        <p className="text-lg font-bold text-brand-600">{fmtFull(newExpiry)}</p>
      </div>
      <p className="mb-4 text-[11px] text-ink-500">
        Payment happens outside this app. Confirming only updates the customer record.
      </p>

      <div className="flex justify-end gap-2">
        <button className="btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={confirm}>
          <Check size={14} /> Confirm renewal
        </button>
      </div>
    </Modal>
  );
}
