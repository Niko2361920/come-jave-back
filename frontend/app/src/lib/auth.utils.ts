export function isJaverianaEmail(value: string): boolean {
  const normalized = value.trim().toLowerCase();

  if (!normalized || !normalized.includes("@")) {
    return false;
  }

  return normalized.endsWith("@javerianacali.edu.co");
}

export function getDisplayName(value?: string | null): string {
  const safeName = (value ?? "").trim();

  return safeName || "Javeriano";
}
