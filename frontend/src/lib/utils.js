import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("fa-AF", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("AFN", {
    style: "currency",
    currency: "AFN",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value) {
  return new Intl.NumberFormat("fa-IR").format(value);
}
