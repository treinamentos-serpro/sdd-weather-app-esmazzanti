import { act, render, renderHook, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import UnitToggle from '../../src/components/UnitToggle';
import { usePersistentUnit } from '../../src/hooks/usePersistentUnit';

describe('preferência de unidade', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('usa Celsius quando a preferência ausente ou inválida', () => {
    localStorage.setItem('weather-app:unit', 'kelvin');

    const { result } = renderHook(() => usePersistentUnit());

    expect(result.current.unit).toBe('celsius');
    expect(localStorage.getItem('weather-app:unit')).toBe('celsius');
  });

  it('lê e persiste Fahrenheit na chave definida', () => {
    localStorage.setItem('weather-app:unit', 'fahrenheit');

    const { result } = renderHook(() => usePersistentUnit());

    expect(result.current.unit).toBe('fahrenheit');

    act(() => {
      result.current.setUnit('celsius');
    });

    expect(localStorage.getItem('weather-app:unit')).toBe('celsius');
  });

  it('permite alternar a unidade por botões acessíveis', () => {
    render(<UnitToggle value="celsius" onChange={() => undefined} />);

    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'false');
  });
});
