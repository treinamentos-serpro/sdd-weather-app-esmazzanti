import { render, screen } from '@testing-library/react';
import App from '../../src/App';

describe('App shell', () => {
  it('renders the initial Portuguese weather app shell', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /sdd weather app/i })).toBeInTheDocument();
    expect(screen.getByText(/previsão do tempo/i)).toBeInTheDocument();
  });
});
