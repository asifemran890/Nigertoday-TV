"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const STYLES = {
  success: { border: "border-emerald-300", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  error: { border: "border-red-300", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  info: { border: "border-slate-200", icon: Info, color: "text-brand-600", bg: "bg-brand-50" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (type, title, message) => {
      const id = ++idRef.current;
      setToasts((t) => [...t, { id, type, title, message }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const api = {
    success: (title, message) => push("success", title, message),
    error: (title, message) => push("error", title, message),
    info: (title, message) => push("info", title, message),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const s = STYLES[t.type];
          const Icon = s.icon;
          return (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border ${s.border} bg-white p-3 shadow-modal`}
            >
              <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${s.bg} ${s.color}`}>
                <Icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-ink-900">{t.title}</p>
                {t.message && <p className="mt-0.5 text-xs text-ink-500">{t.message}</p>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-ink-400 hover:text-ink-700"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
