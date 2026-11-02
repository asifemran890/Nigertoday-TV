"use client";

import { Search } from "lucide-react";
import { initials } from "@/lib/helpers";

export function Avatar({ name, size = "sm" }) {
  const cls = size === "lg" ? "h-11 w-11 text-sm" : "h-8 w-8 text-[11px]";
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-600 ${cls}`}>
      {initials(name)}
    </span>
  );
}

const BADGE = {
  active: "bg-emerald-50 text-emerald-700",
  expiring: "bg-amber-100 text-amber-700",
  expired: "bg-red-100 text-red-600",
};
const DOT = {
  active: "bg-emerald-500",
  expiring: "bg-amber-500",
  expired: "bg-red-500",
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium ${BADGE[status.key]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status.key]}`} />
      {status.label}
    </span>
  );
}

export function SearchBox({ value, onChange, onSubmit }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit && onSubmit(value);
      }}
      className="relative w-full sm:w-72"
    >
      <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search name, phone or email"
        className="input !py-2 pl-9 text-[13px]"
      />
    </form>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-[13px] text-ink-500">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2.5">{children}</div>}
    </div>
  );
}

export function EmptyState({ icon, tone = "green", title, text, action }) {
  const tones = {
    green: "bg-emerald-100 text-emerald-600",
    brand: "bg-brand-50 text-brand-600",
  };
  return (
    <div className="card flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
      <span className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${tones[tone]}`}>{icon}</span>
      <h2 className="text-base font-semibold text-ink-900">{title}</h2>
      <p className="mt-1 max-w-xs text-xs text-ink-500">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function FilterPills({ options, value, onChange }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-slate-200 bg-white text-ink-700 hover:bg-slate-50"
            }`}
          >
            {o.label}
            <span className={`ml-1.5 ${active ? "text-white/80" : "text-ink-400"}`}>{o.count}</span>
          </button>
        );
      })}
    </div>
  );
}
