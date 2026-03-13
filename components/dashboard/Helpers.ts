export function parseCredlyBadgeId(input: string): string | null {
  const idMatch = input.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return idMatch ? idMatch[0] : null;
}
