import { expect, test } from '@playwright/test';

const cityResult = {
  id: 1,
  name: 'São Paulo',
  country: 'Brasil',
  admin1: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
};

const validForecast = {
  timezone: 'America/Sao_Paulo',
  current: {
    time: '2026-09-16T12:00',
    temperature_2m: 21,
    apparent_temperature: 22,
    relative_humidity_2m: 60,
    wind_speed_10m: 10,
    weather_code: 0,
  },
  daily: {
    time: ['2026-09-16'],
    weather_code: [0],
    temperature_2m_min: [18],
    temperature_2m_max: [25],
    precipitation_probability_max: [0],
  },
};

test('exibe estado vazio quando a busca não retorna cidades', async ({ page }) => {
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ results: [] }),
    });
  });

  await page.goto('/');
  await page.getByLabel('Nome da cidade').fill('Cidade inexistente');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('status')).toContainText('Nenhuma cidade encontrada');
});

test('permite retry manual após falha do forecast', async ({ page }) => {
  let forecastAttempts = 0;

  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ results: [cityResult] }),
    });
  });

  await page.route('**/api.open-meteo.com/**', async (route) => {
    forecastAttempts += 1;
    if (forecastAttempts <= 2) {
      await route.fulfill({ status: 503, body: 'service unavailable' });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(validForecast),
    });
  });

  await page.goto('/');
  await page.getByLabel('Nome da cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('button', { name: 'Selecionar São Paulo' }).click();

  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
});
