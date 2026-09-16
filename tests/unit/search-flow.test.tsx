import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { normalizeSearchText, validateSearchText } from '../../src/lib/validation';

describe('search validation and flow', () => {
  it('normalizes and validates input text', () => {
    expect(normalizeSearchText('  são   paulo  ')).toBe('são paulo');
    expect(validateSearchText('')).toBe('Informe o nome da cidade');
    expect(validateSearchText('a'.repeat(101))).toBe(
      'O nome da cidade deve ter até 100 caracteres',
    );
    expect(validateSearchText('São Paulo')).toBeNull();
  });

  it('shows a validation message and blocks invalid submits', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/nome da cidade/i);
    const button = screen.getByRole('button', { name: /buscar/i });

    await user.clear(input);
    await user.click(button);

    expect(screen.getByText('Informe o nome da cidade')).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('renders matching cities when the search resolves successfully', async () => {
    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({
        results: [
          {
            id: 1,
            name: 'São Paulo',
            country: 'Brasil',
            admin1: 'São Paulo',
            latitude: -23.55,
            longitude: -46.63,
          },
          {
            id: 2,
            name: 'São Paulo',
            country: 'Argentina',
            admin1: 'Buenos Aires',
            latitude: -34.6,
            longitude: -58.38,
          },
        ],
      }),
    });

    vi.stubGlobal('fetch', mockFetch);
    render(<App />);

    const input = screen.getByLabelText(/nome da cidade/i);
    await user.type(input, 'Sao Paulo');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /selecionar são paulo/i })).toHaveLength(2);
    });
  });
});
