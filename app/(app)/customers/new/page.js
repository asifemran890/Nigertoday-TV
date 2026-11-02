"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Check, Mail, Phone, User } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import { PageHeader } from "@/components/ui";
import { addMonths, daysBetween, fmtFull, todayISO } from "@/lib/dates";

const OPTIONS = [3, 6, 12];

function IconInput({ icon: Icon, error, ...props }) {
  return (
    <div>
      <div className="relative">
        <Icon size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input {...props} className={`input pl-9 ${error ? "!border-red-400" : ""}`} />
      </div>
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

export default function AddCustomerPage() {
  const { addCustomer } = useStore();
  const toast = useToast();
  const router = useRouter();

  const [form, setForm] = useState({ name: "", phone: "", email: "", startDate: todayISO(), months: 3 });
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const expiry = form.startDate ? addMonths(form.startDate, form.months) : null;
  const daysLeft = expiry ? daysBetween(todayISO(), expiry) : null;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Enter the customer's name.";
    if (!form.phone.trim()) e.phone = "Enter a phone number.";
    else if (form.phone.replace(/\D/g, "").length < 7) e.phone = "Phone number looks too short.";
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (!form.startDate) e.startDate = "Choose a start date.";
    return e;
  };

  const submit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Could not save customer", "Please check the details and try again.");
      return;
    }
    try {
      addCustomer({ ...form, durationMonths: form.months });
      toast.success("Customer added", `${form.name.trim()} · expires ${fmtFull(expiry)}`);
      router.push("/customers");
    } catch {
      toast.error("Could not save customer", "Please check the details and try again.");
    }
  };

  let statusChip = null;
  if (daysLeft !== null) {
    statusChip =
      daysLeft < 0
        ? { cls: "bg-red-100 text-red-600", dot: "bg-red-500", text: `Expired · ${-daysLeft} days ago` }
        : daysLeft <= 10
        ? { cls: "bg-amber-100 text-amber-700", dot: "bg-amber-500", text: `Expiring · ${daysLeft} days left` }
        : { cls: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", text: `Active · ${daysLeft} days left` };
  }

  return (
    <>
      <Link href="/customers" className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:underline">
        <ArrowLeft size={13} /> Customers
      </Link>
      <PageHeader title="Add Customer" subtitle="Save a customer and their subscription. The expiry date is worked out for you." />

      <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-ink-900">Customer information</h2>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Full name</label>
              <IconInput icon={User} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Sarah Khan" error={errors.name} />
            </div>
            <div>
              <label className="label">Phone number</label>
              <IconInput icon={Phone} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 019 2210" inputMode="tel" error={errors.phone} />
            </div>
          </div>
          <div className="mb-5">
            <label className="label">Email <span className="text-ink-400">(optional)</span></label>
            <IconInput icon={Mail} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="sarah@email.com" error={errors.email} />
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h2 className="mb-4 text-sm font-semibold text-ink-900">Subscription</h2>
            <div className="mb-4">
              <label className="label">Subscription start date</label>
              <IconInput icon={Calendar} type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} error={errors.startDate} />
            </div>
            <label className="label">Subscription duration</label>
            <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {OPTIONS.map((m) => {
                const on = form.months === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => set("months", m)}
                    className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left ${
                      on ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className={`mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${on ? "border-brand-600" : "border-slate-300"}`}>
                      {on && <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />}
                    </span>
                    <span>
                      <span className="block text-[13px] font-medium text-ink-900">{m} months</span>
                      <span className="block text-[11px] text-ink-500">
                        Ends {form.startDate ? fmtFull(addMonths(form.startDate, m)) : "—"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end gap-2">
              <Link href="/customers" className="btn-outline">Cancel</Link>
              <button type="submit" className="btn-primary">
                <Check size={14} /> Add Customer
              </button>
            </div>
          </div>
        </div>

        <aside className="card h-fit p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink-900">Subscription summary</h2>
          <dl className="space-y-3 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-ink-500">Start date</dt>
              <dd className="font-semibold text-ink-900">{form.startDate ? fmtFull(form.startDate) : "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Duration</dt>
              <dd className="font-semibold text-ink-900">{form.months} months</dd>
            </div>
          </dl>
          <div className="my-4 rounded-lg bg-brand-50 px-3.5 py-3">
            <p className="text-[11px] text-ink-500">Expiration date</p>
            <p className="text-xl font-bold text-brand-600">{expiry ? fmtFull(expiry) : "—"}</p>
            <p className="text-[11px] text-ink-500">Calculated automatically</p>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-ink-500">Status after saving</span>
            {statusChip && (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusChip.cls}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusChip.dot}`} />
                {statusChip.text}
              </span>
            )}
          </div>
        </aside>
      </form>
    </>
  );
}
