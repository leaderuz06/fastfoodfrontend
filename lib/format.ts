export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export const formatPrice = (price: number) => `$${price.toLocaleString("en-US")}`;
