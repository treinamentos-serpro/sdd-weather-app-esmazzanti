import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StatusMessage from '../../src/components/StatusMessage';

describe('StatusMessage', () => {
  it('exibe retry para erros recuperáveis', () => {
    const onRetry = vi.fn();

    render(
      <StatusMessage
        message="Houve um problema no serviço de clima. Tente novamente."
        error={{
          type: 'http',
          message: 'Houve um problema no serviço de clima. Tente novamente.',
          recoverable: true,
          canRetry: true,
        }}
        onRetry={onRetry}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('orienta a correção da entrada quando o erro não permite retry', () => {
    render(
      <StatusMessage
        message="Não foi possível consultar a previsão."
        error={{
          type: 'http',
          message: 'Não foi possível consultar a previsão.',
          recoverable: false,
          canRetry: false,
          statusCode: 400,
        }}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Corrija a entrada');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
