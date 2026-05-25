import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import i18n from "@/i18n";

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
  const locale =
    i18n.language === "en"
      ? "en-US"
      : i18n.language === "ps"
        ? "ps-AF"
        : "fa-AF";
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatCurrency(amount) {
  const locale =
    i18n.language === "en"
      ? "en-US"
      : i18n.language === "ps"
        ? "ps-AF"
        : "fa-AF";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "AFN",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value) {
  const locale =
    i18n.language === "en"
      ? "en-US"
      : i18n.language === "ps"
        ? "ps-AF"
        : "fa-IR";
  return new Intl.NumberFormat(locale).format(value);
}
