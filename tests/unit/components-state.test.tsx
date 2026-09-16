import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SearchForm from '../../src/components/SearchForm';
import SearchResults from '../../src/components/SearchResults';
import StatusMessage from '../../src/components/StatusMessage';

describe('estados dos componentes', () => {
  it('desabilita a busca e informa carregamento', () => {
    render(
      <SearchForm
        value="São Paulo"
        onChange={() => undefined}
        onSubmit={() => undefined}
        loading
        error={null}
      />,
    );

    expect(screen.getByRole('form', { name: 'Busca por cidade' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.getByRole('status')).toHaveTextContent('Buscando cidades');
    expect(screen.getByRole('button', { name: 'Buscando...' })).toBeDisabled();
  });

  it('exibe estado vazio de resultados em português', () => {
    render(<SearchResults results={[]} empty onSelectCity={() => undefined} />);

    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma cidade encontrada');
  });

  it('exibe erro acessível e ação de retry', () => {
    const onRetry = vi.fn();

    render(
      <StatusMessage
        message="Houve um problema no serviço de clima. Tente novamente."
        onRetry={onRetry}
        error={{ type: 'http', message: 'erro', recoverable: true, canRetry: true }}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Tente novamente');
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
  });
});
