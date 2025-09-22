export function formatUSD(value: number | null | undefined) {
  const v = typeof value === "number" ? value : Number(value || 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
}
