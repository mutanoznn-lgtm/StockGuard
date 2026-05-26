export interface Product {
  id: string;
  name: string;
  manufactureDate: string;
  expirationDate: string;
}

export function getDaysUntilExpiration(expirationDate: string): number {
  const [y, m, d] = expirationDate.split("-").map(Number);
  const exp = new Date(y, m - 1, d);
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const diffTime = exp.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getStatusColor(days: number): "green" | "yellow" | "red" {
  if (days < 3) return "red";
  if (days <= 7) return "yellow";
  return "green";
}

export function getStatusLabel(days: number): string {
  if (days < 0) return `Venceu há ${Math.abs(days)} dia${Math.abs(days) !== 1 ? "s" : ""}`;
  if (days === 0) return "Vence hoje!";
  return `Vence em ${days} dia${days !== 1 ? "s" : ""}`;
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export function generateWhatsAppText(products: { name: string; manufactureDate: string; expirationDate: string }[]): string {
  const lines = products.map((p) => {
    const days = getDaysUntilExpiration(p.expirationDate);
    const status = getStatusLabel(days);
    return `📦 ${p.name} — Venc: ${formatDate(p.expirationDate)} — ${status}`;
  });
  return `🗂️ *Lista de Produtos*\n\n${lines.join("\n")}`;
}
