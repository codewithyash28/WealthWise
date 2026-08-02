import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined, currencyCode: string = "USD", locale: string = "en-US") {
  const safeAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  const safeCode = currencyCode || "USD";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: safeCode,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch (e) {
    return `${safeCode} ${safeAmount.toLocaleString(locale, { maximumFractionDigits: 2 })}`;
  }
}

export function formatNumber(amount: number, locale: string = "en-US") {
  return new Intl.NumberFormat(locale).format(amount);
}
