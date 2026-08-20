export function parseServiceIds(raw?: string): string[] {
  if (!raw) return [];
  return raw.split(",").filter(Boolean);
}
