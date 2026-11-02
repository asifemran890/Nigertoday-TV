"use client";

import { Trash2 } from "lucide-react";
import Modal from "./Modal";

export default function DeleteModal({ customer, onClose, onConfirm }) {
  if (!customer) return null;
  return (
    <Modal
      open
      onClose={onClose}
      icon={<Trash2 size={18} />}
      iconClass="bg-red-50 text-red-600"
      title={`Delete ${customer.name}?`}
    >
      <p className="mb-5 text-xs leading-relaxed text-ink-500">
        This permanently removes the customer and their subscription records. This cannot be undone.
      </p>
      <div className="flex justify-end gap-2">
        <button className="btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn-danger" onClick={onConfirm}>
          <Trash2 size={14} /> Delete customer
        </button>
      </div>
    </Modal>
  );
}
