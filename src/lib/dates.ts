export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString();
}

export type ExpirationStatus = "none" | "ok" | "soon" | "expired";

export function getExpirationStatus(
  dateStr: string | null
): ExpirationStatus {
  if (!dateStr) return "none";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exp = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(exp.getTime())) return "none";

  const diffDays = Math.ceil(
    (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "expired";
  if (diffDays <= 30) return "soon";
  return "ok";
}
