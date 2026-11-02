"use client";

import { useEffect, useState } from "react";
import { Copy, MessageCircle } from "lucide-react";
import Modal from "./Modal";
import { useToast } from "./Toast";
import { buildReminder, defaultTemplate } from "@/lib/helpers";

const TEMPLATES = [
  { key: "7", label: "7 days left" },
  { key: "3", label: "3 days left" },
  { key: "1", label: "1 day left" },
  { key: "expired", label: "Expired" },
];

export default function ReminderModal({ customer, onClose }) {
  const toast = useToast();
  const [template, setTemplate] = useState("3");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!customer) return;
    const t = defaultTemplate(customer);
    setTemplate(t);
    setMessage(buildReminder(customer, t));
  }, [customer]);

  if (!customer) return null;

  const pick = (key) => {
    setTemplate(key);
    setMessage(buildReminder(customer, key));
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Message copied", "Paste it into WhatsApp, SMS or any app.");
      onClose();
    } catch {
      toast.error("Could not copy", "Select the message and copy it manually.");
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      width="max-w-lg"
      icon={<MessageCircle size={18} />}
      title="Send reminder"
      subtitle={`${customer.name} · ${customer.phone}`}
    >
      <p className="label">Quick template</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.key}
            onClick={() => pick(t.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              template === t.key
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-slate-200 text-ink-700 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <label className="label" htmlFor="msg">Message</label>
      <textarea
        id="msg"
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="input mb-4 resize-none text-[13px] leading-relaxed"
      />

      <div className="flex justify-end gap-2">
        <button className="btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={copy}>
          <Copy size={14} /> Copy message
        </button>
      </div>
    </Modal>
  );
}
