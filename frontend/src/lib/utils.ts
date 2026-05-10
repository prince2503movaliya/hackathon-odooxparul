import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  INR: "₹",
};

export function formatCurrency(amount: number, currency: string): string {
  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${amount.toLocaleString()}`;
}
