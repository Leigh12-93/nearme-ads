import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-AU").format(n);
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`;
}
