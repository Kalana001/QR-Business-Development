import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  const upperCurr = (currency || 'USD').toUpperCase();
  try {
    if (upperCurr === 'LKR') {
      return `Rs ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: upperCurr,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${upperCurr} ${amount.toFixed(2)}`;
  }
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')       // Replace spaces and underscores with -
    .replace(/[^\w\-]+/g, '')       // Remove non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
}

export function formatDuration(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return '';
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) {
    return hours === 1 ? '1 hr' : `${hours} hrs`;
  }
  return `${hours} hr ${remainingMins} mins`;
}

/**
 * Calculates WCAG relative luminance of a hex color and returns either a dark foreground ('#0F172A')
 * or a light foreground ('#FFFFFF') to guarantee high contrast readability (>= 4.5:1 WCAG AA standard).
 */
export function getContrastTextColor(hexColor?: string | null): string {
  if (!hexColor) return '#FFFFFF';

  let hex = hexColor.replace('#', '').trim();
  if (hex.length === 3) {
    hex = hex.split('').map((char) => char + char).join('');
  }

  if (hex.length !== 6) return '#FFFFFF';

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  // Luminance > 0.45 indicates a light background -> return dark readable text (#0F172A)
  // Luminance <= 0.45 indicates a dark background -> return crisp white text (#FFFFFF)
  return luminance > 0.45 ? '#0F172A' : '#FFFFFF';
}
