import { describe, expect, it } from 'vitest';
import { normalizeSearchText, validateSearchText } from '../../src/lib/validation';

describe('validação de busca', () => {
  it('normaliza entrada vazia, espaços extras e acentos', () => {
    expect(normalizeSearchText('')).toBe('');
    expect(normalizeSearchText('   São   José   ')).toBe('São José');
    expect(normalizeSearchText('  Belo Horizonte  ')).toBe('Belo Horizonte');
  });

  it('rejeita nomes com mais de 100 caracteres após normalização', () => {
    expect(validateSearchText(` ${'a'.repeat(101)} `)).toBe(
      'O nome da cidade deve ter até 100 caracteres',
    );
  });

  it('aceita uma cidade válida', () => {
    expect(validateSearchText('São Paulo')).toBeNull();
  });
});
