import { getStatus } from "./dates";

export function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

export function matchesQuery(customer, q) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return (
    customer.name.toLowerCase().includes(s) ||
    customer.phone.toLowerCase().includes(s) ||
    (customer.email || "").toLowerCase().includes(s)
  );
}

export function withStatus(customers) {
  return customers.map((c) => ({ ...c, status: getStatus(c) }));
}

export function monthsLabel(m) {
  return `${m} month${m === 1 ? "" : "s"}`;
}

export function buildReminder(customer, template) {
  const first = customer.name.split(" ")[0];
  const status = getStatus(customer);
  const expiry = new Date(customer.expiryDate + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (template === "expired") {
    return `Hi ${first}, your TV subscription expired on ${expiry}. Please renew to restore your service. Thank you!`;
  }
  const n = status.days;
  const when =
    template === "1"
      ? "(1 day left)"
      : n <= 0
      ? "(today)"
      : `(${n} day${n === 1 ? "" : "s"} left)`;
  return `Hi ${first}, your TV subscription expires on ${expiry} ${when}. Please renew to keep your service running. Thank you!`;
}

export function defaultTemplate(customer) {
  const { days } = getStatus(customer);
  if (days < 0) return "expired";
  if (days <= 1) return "1";
  if (days <= 3) return "3";
  return "7";
}
