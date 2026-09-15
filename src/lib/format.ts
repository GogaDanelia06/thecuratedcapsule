const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const change = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 0,
  signDisplay: "exceptZero",
});

export function formatPrice(amount: number) {
  return currency.format(amount);
}

export function formatChange(ratio: number) {
  return change.format(ratio).replace("-", "−");
}

export function relativeChange(from: number, to: number) {
  return (to - from) / from;
}

const smallNumbers = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
];

export function spellCount(count: number) {
  return smallNumbers[count] ?? String(count);
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

const longDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(isoDate: string) {
  return longDate.format(new Date(isoDate));
}
