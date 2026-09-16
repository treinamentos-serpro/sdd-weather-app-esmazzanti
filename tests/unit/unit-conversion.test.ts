import { describe, expect, it } from 'vitest';
import {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  roundToOneDecimal,
} from '../../src/lib/temperature';

describe('conversão de unidades', () => {
  it('converte os valores inteiros de referência', () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
    expect(celsiusToFahrenheit(100)).toBe(212);
    expect(fahrenheitToCelsius(32)).toBe(0);
    expect(fahrenheitToCelsius(68)).toBe(20);
  });

  it('converte valores decimais', () => {
    expect(celsiusToFahrenheit(21)).toBeCloseTo(69.8, 1);
    expect(fahrenheitToCelsius(50)).toBeCloseTo(10, 1);
  });

  it('arredonda para no máximo uma casa decimal', () => {
    expect(roundToOneDecimal(20)).toBe(20);
    expect(roundToOneDecimal(69.84)).toBe(69.8);
    expect(roundToOneDecimal(69.86)).toBe(69.9);
  });

  it.each([Number.NaN, null, undefined])('rejeita valor inválido: %s', (value) => {
    expect(() => celsiusToFahrenheit(value as unknown as number)).toThrow(TypeError);
    expect(() => fahrenheitToCelsius(value as unknown as number)).toThrow(TypeError);
    expect(() => roundToOneDecimal(value as unknown as number)).toThrow(TypeError);
  });
});
