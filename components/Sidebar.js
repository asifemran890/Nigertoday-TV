"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Clock, LayoutGrid, LogOut, Menu, Sun, Users } from "lucide-react";
import Logo from "./Logo";
import { useStore } from "@/lib/store";
import { getStatus } from "@/lib/dates";
import { initials } from "@/lib/helpers";

function NavContent({ mobile = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
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
    { href: "/settings", label: "Settings", icon: Sun },
  ];

  const logoutButton = (
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
  );

  if (mobile) {
    return (
      <>
        {moreOpen && (
          <div className="fixed bottom-20 right-3 z-50 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-modal lg:hidden">
            {items.slice(3).map((it) => {
              const Icon = it.icon;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-ink-700 hover:bg-slate-50"
                >
                  <Icon size={15} />
                  <span className="flex-1">{it.label}</span>
                  {it.badge > 0 && (
                    <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold text-white ${it.badgeClass}`}>
                      {it.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <button
              onClick={() => {
                setMoreOpen(false);
                logout();
                router.replace("/login");
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-ink-700 hover:bg-slate-50"
            >
              <LogOut size={15} />
              <span>Log out</span>
            </button>
          </div>
        )}

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/70 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(15,23,42,0.06)] lg:hidden">
          <div className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 pt-2">
            {items.slice(0, 3).map((it) => {
              const active = pathname === it.href || pathname.startsWith(it.href + "/");
              const Icon = it.icon;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[10px] font-medium transition-colors ${
                    active ? "text-brand-600" : "text-ink-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="relative">
                    <Icon size={20} />
                    {it.badge > 0 && (
                      <span className={`absolute -right-2 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-semibold text-white ${it.badgeClass}`}>
                        {it.badge}
                      </span>
                    )}
                  </span>
                  <span className="truncate">{it.label}</span>
                </Link>
              );
            })}
            <button
              onClick={() => setMoreOpen((open) => !open)}
              className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[10px] font-medium transition-colors ${
                moreOpen || pathname.startsWith("/expired") || pathname.startsWith("/settings")
                  ? "text-brand-600"
                  : "text-ink-500 hover:bg-slate-50"
              }`}
              aria-expanded={moreOpen}
              aria-label="More navigation options"
            >
              <Menu size={20} />
              <span>More</span>
            </button>
          </div>
        </nav>
      </>
    );
  }

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
        {logoutButton}
      </div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-slate-200/70 bg-sidebar lg:block">
        <NavContent />
      </aside>
      <NavContent mobile />
    </>
  );
}
