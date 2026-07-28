import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function api(path: string) {
  const base = import.meta.env.PUBLIC_API_URL || "http://localhost:3000";
  return `${base}${path}`;
}