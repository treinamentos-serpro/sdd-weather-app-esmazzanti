export function normalizeSearchText(value: string): string {
  return value.trim().replace(/\s+/gu, ' ');
}

export function validateSearchText(value: string): string | null {
  const normalized = normalizeSearchText(value);

  if (normalized.length === 0) {
    return 'Informe o nome da cidade';
  }

  if (normalized.length > 100) {
    return 'O nome da cidade deve ter até 100 caracteres';
  }

  return null;
}
