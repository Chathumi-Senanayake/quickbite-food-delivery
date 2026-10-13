export function formatLKR(amountInLKR: number | string): string {
  const amount = typeof amountInLKR === 'string'
    ? Number.parseFloat(amountInLKR)
    : amountInLKR

  const formattedAmount = new Intl.NumberFormat('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0)

  return `Rs.${formattedAmount}`
}
