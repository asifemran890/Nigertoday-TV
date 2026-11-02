import { addDays, addMonths, todayISO } from "./dates";

// Builds demo data relative to today, so the app always has 30 customers:
// 24 active, 4 expiring within 10 days, 2 expired (matching the designs).

function make(id, name, phone, email, months, daysLeft, history) {
  const today = todayISO();
  const expiryDate = addDays(today, daysLeft);
  const startDate = addMonths(expiryDate, -months);
  const entries = history || [
    { type: "first", months, from: startDate, to: expiryDate },
  ];
  return {
    id,
    name,
    phone,
    email,
    startDate,
    durationMonths: months,
    expiryDate,
    createdAt: entries[entries.length - 1].from,
    renewals: entries,
  };
}

export function buildSeed() {
  const today = todayISO();
  const list = [];

  // John has a renewal history, like the details design.
  const johnExpiry = addDays(today, 3);
  const johnStart = addMonths(johnExpiry, -3);
  const johnFirstStart = addMonths(johnStart, -3);
  list.push({
    id: "c1",
    name: "John Smith",
    phone: "+1 555 012 3456",
    email: "john@email.com",
    startDate: johnStart,
    durationMonths: 3,
    expiryDate: johnExpiry,
    createdAt: johnFirstStart,
    renewals: [
      { type: "first", months: 3, from: johnFirstStart, to: johnStart },
      { type: "renewal", months: 3, from: johnStart, to: johnExpiry },
    ],
  });

  list.push(make("c2", "Michael Brown", "+1 555 013 7788", "michael@email.com", 3, 7));
  list.push(make("c3", "Sarah Khan", "+1 555 019 2210", "sarah@email.com", 3, 92));
  list.push(make("c4", "David Lee", "+1 555 014 6621", "david@email.com", 6, 10));
  list.push(make("c5", "Emma Wilson", "+1 555 011 9034", "emma@email.com", 12, 212));
  list.push(make("c6", "Robert Hall", "+1 555 017 4410", "robert@email.com", 6, -2));
  list.push(make("c7", "James Cole", "+1 555 018 2965", "james@email.com", 6, -5));
  list.push(make("c8", "Priya Das", "+1 555 016 8802", "priya@email.com", 3, 10));

  const extra = [
    "Aisha Bello", "Chinedu Okafor", "Fatima Musa", "Ibrahim Yusuf",
    "Grace Adeyemi", "Samuel Eze", "Zainab Abdullahi", "Tunde Balogun",
    "Ngozi Nwosu", "Hassan Garba", "Blessing Okoro", "Musa Danjuma",
    "Amaka Obi", "Kelechi Nnamdi", "Hauwa Sani", "Daniel Ojo",
    "Maryam Lawal", "Emeka Chukwu", "Halima Aliyu", "Peter Idowu",
    "Rukayya Bala", "Joseph Akin",
  ];
  const durations = [3, 6, 12];
  extra.forEach((name, i) => {
    const slug = name.toLowerCase().replace(/[^a-z]+/g, ".");
    const phone = `+1 555 02${i % 10} ${String(1000 + i * 37).slice(0, 4)}`;
    list.push(
      make(
        `c${9 + i}`,
        name,
        phone,
        `${slug}@email.com`,
        durations[i % 3],
        14 + ((i * 13) % 160)
      )
    );
  });

  return list;
}
