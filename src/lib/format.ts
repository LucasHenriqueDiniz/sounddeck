export function formatDuration(ms: number | undefined): string {
  if (ms === undefined) return "—";
  const seconds = ms / 1000;
  return `${seconds.toFixed(1).replace(".", ",")}s`;
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function truncateMiddle(text: string, max = 34): string {
  if (text.length <= max) return text;
  const keep = Math.floor((max - 1) / 2);
  return `${text.slice(0, keep)}…${text.slice(text.length - keep)}`;
}
