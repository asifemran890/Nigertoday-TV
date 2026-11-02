"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import { PageHeader } from "@/components/ui";
import PasswordModal from "@/components/PasswordModal";

function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[13px] text-ink-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-10 rounded-full transition-colors ${checked ? "bg-brand-600" : "bg-slate-300"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[18px]" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateUser, settings, updateSettings } = useStore();
  const toast = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [pwOpen, setPwOpen] = useState(false);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
  }, [user.name, user.email]);

  const save = (e) => {
    e.preventDefault();
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      toast.error("Could not save changes", "Enter your name and a valid email address.");
      return;
    }
    updateUser({ name: name.trim(), email: email.trim() });
    toast.success("Changes saved");
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your account and password." />

      <div className="max-w-2xl space-y-5">
        <form onSubmit={save} className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink-900">Account</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="btn-primary">Save changes</button>
          </div>
        </form>

        <div className="card flex items-center justify-between gap-3 p-5">
          <div>
            <h2 className="text-sm font-semibold text-ink-900">Password</h2>
            <p className="text-[11px] text-ink-500">Use a strong password that only you know.</p>
          </div>
          <button className="btn-outline" onClick={() => setPwOpen(true)}>
            <Lock size={14} /> Change password
          </button>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-ink-900">Reminder settings</h2>
              <p className="text-[11px] text-ink-500">Choose when a customer shows up as “Expiring soon”.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-ink-500">Optional</span>
          </div>
          <Toggle label="Remind me 7 days before expiry" checked={settings.remind7} onChange={(v) => updateSettings({ remind7: v })} />
          <Toggle label="Remind me 3 days before expiry" checked={settings.remind3} onChange={(v) => updateSettings({ remind3: v })} />
          <Toggle label="Remind me 1 day before expiry" checked={settings.remind1} onChange={(v) => updateSettings({ remind1: v })} />
        </div>
      </div>

      <PasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
    </>
  );
}
