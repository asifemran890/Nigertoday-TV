"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Copy, Mail, MessageCircle, Pencil, Phone, RefreshCw, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import { Avatar } from "@/components/ui";
import ReminderModal from "@/components/ReminderModal";
import RenewModal from "@/components/RenewModal";
import DeleteModal from "@/components/DeleteModal";
import Modal from "@/components/Modal";
import { daysBetween, fmtFull, fmtShort, getStatus } from "@/lib/dates";
import { monthsLabel } from "@/lib/helpers";

function EditModal({ customer, onClose }) {
  const { updateCustomer } = useStore();
  const toast = useToast();
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [email, setEmail] = useState(customer.email || "");

  const save = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Could not save customer", "Name and phone are required.");
      return;
    }
    updateCustomer(customer.id, { name: name.trim(), phone: phone.trim(), email: email.trim() });
    toast.success("Customer updated");
    onClose();
  };

  return (
    <Modal open onClose={onClose} icon={<Pencil size={18} />} title="Edit customer" subtitle={customer.name}>
      <form onSubmit={save}>
        <div className="mb-3">
          <label className="label">Full name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="label">Phone number</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="mb-5">
          <label className="label">Email</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary"><Check size={14} /> Save changes</button>
        </div>
      </form>
    </Modal>
  );
}

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const { customers, deleteCustomer } = useStore();
  const [modal, setModal] = useState(null); // 'renew' | 'reminder' | 'delete' | 'edit'

  const customer = customers.find((c) => c.id === id);

  if (!customer) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm font-semibold text-ink-900">Customer not found</p>
        <p className="mb-4 mt-1 text-xs text-ink-500">They may have been deleted.</p>
        <Link href="/customers" className="btn-primary">Back to customers</Link>
      </div>
    );
  }

  const status = getStatus(customer);
  const total = Math.max(1, daysBetween(customer.startDate, customer.expiryDate));
  const pct = Math.min(100, Math.max(0, Math.round((daysBetween(customer.startDate, localToday()) / total) * 100)));

  function localToday() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  const tone =
    status.key === "expired"
      ? { big: "text-red-600", bar: "bg-red-500", chip: "bg-red-100 text-red-600", dot: "bg-red-500", text: "Expired" }
      : status.key === "expiring"
      ? { big: "text-amber-600", bar: "bg-amber-500", chip: "bg-amber-100 text-amber-700", dot: "bg-amber-500", text: `Expiring · ${status.label}` }
      : { big: "text-emerald-600", bar: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", text: "Active" };

  const bigText =
    status.key === "expired"
      ? `Expired ${status.label}`
      : status.days === 0
      ? "Expires today"
      : `${status.days} day${status.days === 1 ? "" : "s"} left`;

  const copy = async (text, what) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${what} copied`);
    } catch {
      toast.error("Could not copy");
    }
  };

  const history = [...customer.renewals].reverse();

  return (
    <>
      <Link href="/customers" className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:underline">
        <ArrowLeft size={13} /> Customers
      </Link>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={customer.name} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">{customer.name}</h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${tone.chip}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                {tone.text}
              </span>
            </div>
            <p className="text-xs text-ink-500">Customer since {fmtFull(customer.createdAt)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-outline" onClick={() => setModal("edit")}><Pencil size={14} /> Edit</button>
          <button className="btn-soft" onClick={() => setModal("reminder")}><MessageCircle size={14} /> Send Reminder</button>
          <button className="btn-primary" onClick={() => setModal("renew")}><RefreshCw size={14} /> Renew Subscription</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-ink-900">Subscription</h2>
            <p className="mb-4 text-[11px] text-ink-500">Current plan details</p>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <p className={`text-4xl font-bold ${tone.big}`}>{bigText}</p>
              <p className="text-xs text-ink-500">Expires {fmtFull(customer.expiryDate)}</p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${pct}%` }} />
            </div>
            <div className="mb-4 mt-1.5 flex justify-between text-[11px] text-ink-500">
              <span>{fmtShort(customer.startDate)}</span>
              <span>{fmtShort(customer.expiryDate)}</span>
            </div>
            <dl className="divide-y divide-slate-100 border-t border-slate-100 text-[13px]">
              {[
                ["Start date", fmtFull(customer.startDate)],
                ["Duration", monthsLabel(customer.durationMonths)],
                ["Expiration date", fmtFull(customer.expiryDate)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-3">
                  <dt className="text-ink-500">{k}</dt>
                  <dd className="font-semibold text-ink-900">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold text-ink-900">Renewal history</h2>
            <p className="mb-3 text-[11px] text-ink-500">Every time this subscription was renewed</p>
            <ul className="divide-y divide-slate-100 border-t border-slate-100">
              {history.map((h, i) => (
                <li key={i} className="flex items-center gap-3 py-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Check size={14} />
                  </span>
                  <div>
                    <p className="text-[13px] font-medium text-ink-900">
                      {h.type === "first" ? `First subscription · ${h.months} months` : `Renewed for ${h.months} months`}
                    </p>
                    <p className="text-[11px] text-ink-500">
                      {fmtFull(h.from)} → {fmtFull(h.to)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold text-ink-900">Contact</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-ink-700"><Phone size={15} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-ink-500">Phone</p>
                  <p className="text-[13px] font-medium text-ink-900">{customer.phone}</p>
                </div>
                <button onClick={() => copy(customer.phone, "Phone")} className="text-ink-400 hover:text-brand-600" aria-label="Copy phone"><Copy size={14} /></button>
              </div>
              {customer.email && (
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-ink-700"><Mail size={15} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-ink-500">Email</p>
                    <p className="truncate text-[13px] font-medium text-ink-900">{customer.email}</p>
                  </div>
                  <button onClick={() => copy(customer.email, "Email")} className="text-ink-400 hover:text-brand-600" aria-label="Copy email"><Copy size={14} /></button>
                </div>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold text-ink-900">Delete customer</h2>
            <p className="mb-3 mt-1 text-[11px] text-ink-500">
              Removes this customer and their subscription records. This cannot be undone.
            </p>
            <button className="btn-outline" onClick={() => setModal("delete")}>
              <Trash2 size={14} /> Delete customer
            </button>
          </div>
        </div>
      </div>

      {modal === "edit" && <EditModal customer={customer} onClose={() => setModal(null)} />}
      {modal === "renew" && <RenewModal customer={customer} onClose={() => setModal(null)} />}
      {modal === "reminder" && <ReminderModal customer={customer} onClose={() => setModal(null)} />}
      {modal === "delete" && (
        <DeleteModal
          customer={customer}
          onClose={() => setModal(null)}
          onConfirm={() => {
            const name = customer.name;
            deleteCustomer(customer.id);
            toast.success("Customer deleted", name);
            router.push("/customers");
          }}
        />
      )}
    </>
  );
}
