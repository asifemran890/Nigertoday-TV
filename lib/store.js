"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { addMonths, daysBetween, todayISO } from "./dates";
import { buildSeed } from "./seed";

const KEY = "nt_data_v1";

const DEFAULT_USER = {
  name: "Alex Owner",
  email: "owner@email.com",
  username: "owner",
  password: "admin123",
};

const DEFAULT_SETTINGS = { remind7: true, remind3: true, remind1: true };

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [user, setUser] = useState(DEFAULT_USER);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [session, setSession] = useState(false);

  // Load from localStorage (or seed on first run).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setCustomers(data.customers || []);
        setUser({ ...DEFAULT_USER, ...(data.user || {}) });
        setSettings({ ...DEFAULT_SETTINGS, ...(data.settings || {}) });
        setSession(!!data.session);
      } else {
        setCustomers(buildSeed());
      }
    } catch {
      setCustomers(buildSeed());
    }
    setReady(true);
  }, []);

  // Persist on change.
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ customers, user, settings, session }));
    } catch {
      /* storage unavailable */
    }
  }, [ready, customers, user, settings, session]);

  const login = useCallback(
    (identifier, password) => {
      const id = identifier.trim().toLowerCase();
      const okId = id === user.email.toLowerCase() || id === user.username.toLowerCase();
      if (okId && password === user.password) {
        setSession(true);
        return { ok: true };
      }
      return { ok: false, error: "Incorrect email/username or password." };
    },
    [user]
  );

  const logout = useCallback(() => setSession(false), []);

  const addCustomer = useCallback((data) => {
    const expiryDate = addMonths(data.startDate, data.durationMonths);
    const customer = {
      id: `c${Date.now()}`,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: (data.email || "").trim(),
      startDate: data.startDate,
      durationMonths: data.durationMonths,
      expiryDate,
      createdAt: data.startDate,
      renewals: [
        { type: "first", months: data.durationMonths, from: data.startDate, to: expiryDate },
      ],
    };
    setCustomers((prev) => [customer, ...prev]);
    return customer;
  }, []);

  const updateCustomer = useCallback((id, patch) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  // Renewing extends from the current expiry if still running, otherwise from today.
  const renewCustomer = useCallback((id, months) => {
    let result = null;
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const today = todayISO();
        const from = daysBetween(today, c.expiryDate) >= 0 ? c.expiryDate : today;
        const to = addMonths(from, months);
        result = { ...c, startDate: from, durationMonths: months, expiryDate: to };
        result.renewals = [...c.renewals, { type: "renewal", months, from, to }];
        return result;
      })
    );
    return result;
  }, []);

  const deleteCustomer = useCallback((id) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateUser = useCallback((patch) => setUser((u) => ({ ...u, ...patch })), []);

  const changePassword = useCallback(
    (current, next) => {
      if (current !== user.password) return { ok: false, error: "Current password is incorrect." };
      setUser((u) => ({ ...u, password: next }));
      return { ok: true };
    },
    [user]
  );

  const updateSettings = useCallback((patch) => setSettings((s) => ({ ...s, ...patch })), []);

  const value = useMemo(
    () => ({
      ready,
      session,
      customers,
      user,
      settings,
      login,
      logout,
      addCustomer,
      updateCustomer,
      renewCustomer,
      deleteCustomer,
      updateUser,
      changePassword,
      updateSettings,
    }),
    [
      ready, session, customers, user, settings, login, logout, addCustomer,
      updateCustomer, renewCustomer, deleteCustomer, updateUser, changePassword,
      updateSettings,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
