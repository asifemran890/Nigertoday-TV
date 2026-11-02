// Date helpers. All dates are stored as local "YYYY-MM-DD" strings.

const pad = (n) => String(n).padStart(2, "0");

export function toISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO() {
  return toISO(new Date());
}

export function parseISO(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso, n) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

// Adds whole months, clamping to the last day of the month (Jan 31 + 1mo = Feb 28).
export function addMonths(iso, n) {
  const d = parseISO(iso);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return toISO(d);
}

export function daysBetween(fromISO, toISOStr) {
  return Math.round((parseISO(toISOStr) - parseISO(fromISO)) / 86400000);
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// "Oct 8, 2026"
export function fmtFull(iso) {
  const d = parseISO(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// "Oct 8" for the current year, otherwise "Jan 5, 2027"
export function fmtShort(iso) {
  const d = parseISO(iso);
  const base = `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  return d.getFullYear() === new Date().getFullYear()
    ? base
    : `${base}, ${d.getFullYear()}`;
}

// "Monday, November 2, 2026"
export function fmtToday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export const EXPIRING_WINDOW_DAYS = 10;

// Status of a customer's subscription relative to today.
export function getStatus(customer) {
  const days = daysBetween(todayISO(), customer.expiryDate);
  if (days < 0) {
    const ago = -days;
    return {
      key: "expired",
      days,
      label: `${ago} day${ago === 1 ? "" : "s"} ago`,
    };
  }
  if (days <= EXPIRING_WINDOW_DAYS) {
    return {
      key: "expiring",
      days,
      label: days === 0 ? "Expires today" : `${days} day${days === 1 ? "" : "s"} left`,
    };
  }
  return { key: "active", days, label: "Active" };
}
