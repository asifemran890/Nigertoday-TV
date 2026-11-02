"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Clock, LayoutGrid, LogOut, Menu, Settings, Users, X } from "lucide-react";
import Logo from "./Logo";
import { useStore } from "@/lib/store";
import { getStatus } from "@/lib/dates";
import { initials } from "@/lib/helpers";

function NavContent({ onNavigate }) {
  const pathname = usePathname();
  const router = useRouter();
  const { customers, user, logout } = useStore();

  const counts = customers.reduce(
    (acc, c) => {
      const k = getStatus(c).key;
      if (k === "expiring") acc.expiring++;
      if (k === "expired") acc.expired++;
      return acc;
    },
    { expiring: 0, expired: 0 }
  );

  const items = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/customers", label: "Customers", icon: Users },
    { href: "/expiring", label: "Expiring", icon: Clock, badge: counts.expiring, badgeClass: "bg-amber-600" },
    { href: "/expired", label: "Expired", icon: AlertTriangle, badge: counts.expired, badgeClass: "bg-red-600" },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-full flex-col px-3 py-5">
      <div className="mb-8 px-2">
        <Logo />
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                active ? "bg-brand-600 text-white shadow-sm" : "text-ink-500 hover:bg-white/70 hover:text-ink-900"
              }`}
            >
              <Icon size={16} />
              <span className="flex-1">{it.label}</span>
              {it.badge > 0 && (
                <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold text-white ${it.badgeClass}`}>
                  {it.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-2.5 border-t border-slate-200/70 px-2 pt-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-[11px] font-semibold text-brand-600">
          {initials(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-ink-900">{user.name}</p>
          <p className="text-[11px] text-ink-500">Business owner</p>
        </div>
        <button
          onClick={() => {
            logout();
            router.replace("/login");
          }}
          className="rounded-md p-1.5 text-ink-500 hover:bg-white hover:text-ink-900"
          aria-label="Log out"
          title="Log out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-slate-200/70 bg-sidebar lg:block">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/70 bg-sidebar px-4 py-3 lg:hidden">
        <Logo className="h-12" />
        <button onClick={() => setOpen(true)} className="rounded-md p-2 text-ink-700 hover:bg-white" aria-label="Open menu">
          <Menu size={20} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-sidebar shadow-modal">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-md p-1.5 text-ink-500 hover:bg-white"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            <NavContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
