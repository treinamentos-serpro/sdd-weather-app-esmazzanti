import { useEffect, useState } from 'react';
import type { Unit } from '../types/weather';

const UNIT_STORAGE_KEY = 'weather-app:unit';

function readStoredUnit(): Unit {
  try {
    const storedUnit = globalThis.localStorage.getItem(UNIT_STORAGE_KEY);
    return storedUnit === 'fahrenheit' ? 'fahrenheit' : 'celsius';
  } catch {
    return 'celsius';
  }
}

export function usePersistentUnit() {
  const [unit, setUnit] = useState<Unit>(readStoredUnit);

  useEffect(() => {
    try {
      globalThis.localStorage.setItem(UNIT_STORAGE_KEY, unit);
    } catch {
      // A preferência continua válida em memória quando o armazenamento não está disponível.
    }
  }, [unit]);

  return { unit, setUnit };
}
