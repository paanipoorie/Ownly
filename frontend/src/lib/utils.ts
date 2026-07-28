import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { WarrantyStatus, ExchangeStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function api(path: string) {
  const base = import.meta.env.PUBLIC_API_URL || "http://localhost:3000";
  return `${base}${path}`;
}

export function formatCurrency(amount: number, currency = "INR"): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency || "₹"} ${amount.toLocaleString()}`;
  }
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function getWarrantyStatus(warrantyExpiry?: string): {
  status: WarrantyStatus;
  daysLeft: number | null;
  label: string;
} {
  if (!warrantyExpiry) {
    return { status: "none", daysLeft: null, label: "No Warranty" };
  }
  const expiry = new Date(warrantyExpiry).getTime();
  const now = new Date().setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: "expired", daysLeft: diffDays, label: "Warranty Expired" };
  } else if (diffDays <= 30) {
    return {
      status: "expiring_soon",
      daysLeft: diffDays,
      label: `Expires in ${diffDays} day${diffDays === 1 ? "" : "s"}`,
    };
  } else {
    return {
      status: "active",
      daysLeft: diffDays,
      label: `Active (${Math.floor(diffDays / 30)}m left)`,
    };
  }
}

export function getExchangeStatus(exchangeDeadline?: string): {
  status: ExchangeStatus;
  daysLeft: number | null;
  label: string;
} {
  if (!exchangeDeadline) {
    return { status: "none", daysLeft: null, label: "No Exchange" };
  }
  const deadline = new Date(exchangeDeadline).getTime();
  const now = new Date().setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: "expired", daysLeft: diffDays, label: "Exchange Passed" };
  } else if (diffDays <= 7) {
    return {
      status: "expiring_soon",
      daysLeft: diffDays,
      label: `Exchange closes in ${diffDays} day${diffDays === 1 ? "" : "s"}`,
    };
  } else {
    return {
      status: "active",
      daysLeft: diffDays,
      label: `Exchange Open (${diffDays}d left)`,
    };
  }
}