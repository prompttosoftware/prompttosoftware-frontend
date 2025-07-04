import { Duration } from 'date-fns';

/**
 * Formats a duration object into a human-readable string.
 * @param duration The duration object from date-fns (e.g., `intervalToDuration`).
 * @param options Options for formatting:
 *  - `zero`: If true, displays seconds even if hours and minutes are zero.
 *  - `delimiter`: The string to use between parts (e.g., ' ', ', ').
 * @returns A formatted duration string (e.g., "1h 30m 5s", "5s").
 */
export const formatDuration = (duration: Duration, options?: { zero?: boolean; delimiter?: string }) => {
  const parts: string[] = [];
  if (duration.hours) parts.push(`${duration.hours}h`);
  if (duration.minutes) parts.push(`${duration.minutes}m`);
  // Always show seconds if there are no hours or minutes, or if zero is true
  if (duration.seconds || (options?.zero && parts.length === 0)) parts.push(`${duration.seconds || 0}s`);
  return parts.join(options?.delimiter || ' ');
};

/**
 * Formats a number into a USD currency string.
 * @param amount The number to format as currency.
 * @returns A formatted currency string (e.g., "$1,234.56").
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
