// =============================================================================
// SplitBliz — Currency formatter
// CRITICAL: amount is always a decimal string from the API — never a number.
// Never use parseFloat for financial display. Use this utility everywhere.
// =============================================================================

import { CURRENCY_CONFIG } from '../constants/app';

/**
 * Format a monetary decimal string for display.
 * Input: "18000.00", currency: "INR"
 * Output: "₹18,000.00"
 */
function formatNumber(amount: string): string {
  const num = Number(amount); // safe — display only, never arithmetic
  let formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  if (formatted.endsWith('.00')) {
    formatted = formatted.slice(0, -3);
  }

  return formatted;
}

export function formatCurrency(amount: string, currencyCode: string): string {
  const config = CURRENCY_CONFIG[currencyCode];
  const symbol = config?.symbol ?? currencyCode;
  return `${symbol}${formatNumber(amount)}`;
}

export function formatCurrencyParts(amount: string, currencyCode: string): {
  symbol: string;
  amount: string;
} {
  const config = CURRENCY_CONFIG[currencyCode];
  const symbol = config?.symbol ?? currencyCode;
  return { symbol, amount: formatNumber(amount) };
}

/**
 * Format a net balance string with sign and color indicator.
 * Positive = you are owed (green). Negative = you owe (red).
 */
export function formatBalance(netAmount: string, currencyCode: string): {
  display: string;
  isPositive: boolean;
  isZero: boolean;
} {
  const num = Number(netAmount);
  const abs = Math.abs(num);
  const display = formatCurrency(abs.toFixed(2), currencyCode);
  return {
    display: num > 0 ? `+${display}` : num < 0 ? `-${display}` : display,
    isPositive: num > 0,
    isZero: num === 0,
  };
}
