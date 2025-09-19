import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, options?: { abbreviated?: boolean; showDecimals?: boolean }) {
  const { abbreviated = true, showDecimals = false } = options || {};
  
  if (!abbreviated) {
    return `₹${amount.toLocaleString()}`;
  }

  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  if (absAmount >= 1e12) {
    const value = absAmount / 1e12;
    return `${sign}₹${showDecimals ? value.toFixed(1) : Math.floor(value)}T`;
  } else if (absAmount >= 1e9) {
    const value = absAmount / 1e9;
    return `${sign}₹${showDecimals ? value.toFixed(1) : Math.floor(value)}B`;
  } else if (absAmount >= 1e6) {
    const value = absAmount / 1e6;
    return `${sign}₹${showDecimals ? value.toFixed(1) : Math.floor(value)}M`;
  } else if (absAmount >= 1e3) {
    const value = absAmount / 1e3;
    return `${sign}₹${showDecimals ? value.toFixed(1) : Math.floor(value)}K`;
  } else {
    return `${sign}₹${absAmount.toLocaleString()}`;
  }
}
