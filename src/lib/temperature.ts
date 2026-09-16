export function celsiusToFahrenheit(celsius: number): number {
  assertFiniteNumber(celsius);
  return (celsius * 9) / 5 + 32;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  assertFiniteNumber(fahrenheit);
  return ((fahrenheit - 32) * 5) / 9;
}

export function roundToOneDecimal(value: number): number {
  assertFiniteNumber(value);
  return Number(value.toFixed(1));
}

function assertFiniteNumber(value: number): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError('A temperatura deve ser um número finito.');
  }
}
