import { expect, test } from '@playwright/test';

const forecastPayload = {
  timezone: 'America/Sao_Paulo',
  current: {
    time: '2026-09-16T12:00',
    temperature_2m: 21,
    apparent_temperature: 22,
    relative_humidity_2m: 60,
    wind_speed_10m: 10,
    weather_code: 61,
  },
  daily: {
    time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
    weather_code: [61, 1, 2, 3, 45],
    temperature_2m_min: [18, 19, 20, 21, 22],
    temperature_2m_max: [25, 26, 27, 28, 29],
    precipitation_probability_max: [40, 20, 10, 30, 50],
  },
};

test('permite buscar cidade, visualizar previsão e alterar unidade', async ({ page }) => {
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 1,
            name: 'São Paulo',
            country: 'Brasil',
            admin1: 'São Paulo',
            latitude: -23.55,
            longitude: -46.63,
          },
        ],
      }),
    });
  });

  await page.route('**/api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(forecastPayload),
    });
  });

  await page.goto('/');
  await page.getByLabel('Nome da cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('button', { name: 'Selecionar São Paulo' }).click();

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão para cinco dias' })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(5);

  await page.getByRole('button', { name: '°F' }).click();
  await expect(page.getByText('°F', { exact: false }).first()).toBeVisible();
});
