"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import Modal from "./Modal";
import { useStore } from "@/lib/store";
import { useToast } from "./Toast";

function Field({ label, value, onChange, error, autoFocus }) {
  return (
    <div className="mb-3">
      <label className="label">{label}</label>
      <div className="relative">
        <Lock size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          type="password"
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`input pl-9 ${error ? "!border-red-400" : ""}`}
        />
      </div>
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

export default function PasswordModal({ open, onClose }) {
  const { changePassword } = useStore();
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});

  const close = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
    setErrors({});
    onClose();
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!current) errs.current = "Enter your current password.";
    if (next.length < 8) errs.next = "Use at least 8 characters.";
    if (confirm !== next) errs.confirm = "Passwords do not match.";
    if (Object.keys(errs).length) return setErrors(errs);

    const res = changePassword(current, next);
    if (!res.ok) return setErrors({ current: res.error });
    toast.success("Password updated", "Use your new password next time you log in.");
    close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      icon={<Lock size={18} />}
      title="Change password"
      subtitle="Use at least 8 characters"
    >
      <form onSubmit={submit}>
        <Field label="Current password" value={current} onChange={setCurrent} error={errors.current} autoFocus />
        <Field label="New password" value={next} onChange={setNext} error={errors.next} />
        <Field label="Confirm new password" value={confirm} onChange={setConfirm} error={errors.confirm} />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn-outline" onClick={close}>Cancel</button>
          <button type="submit" className="btn-primary">Update password</button>
        </div>
      </form>
    </Modal>
  );
}
