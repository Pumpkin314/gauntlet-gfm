/**
 * Format an integer cent amount as a US-dollar string (e.g. 2500 -> "$25").
 * Omits fractional cents for cleaner display on donation cards.
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
