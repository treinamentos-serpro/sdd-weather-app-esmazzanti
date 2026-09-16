import type { ApiError } from '../types/api';

interface StatusMessageProps {
  message: string;
  error?: ApiError | null;
  onRetry?: () => void;
  actionLabel?: string;
  tone?: 'default' | 'warning' | 'error';
}

export default function StatusMessage({
  message,
  error,
  onRetry,
  actionLabel = 'Tentar novamente',
  tone = error ? 'error' : 'default',
}: StatusMessageProps) {
  const role = tone === 'error' ? 'alert' : 'status';
  const style =
    tone === 'error'
      ? 'border-rose-400/30 bg-rose-400/10 text-rose-100'
      : tone === 'warning'
        ? 'border-amber-400/30 bg-amber-400/10 text-amber-100'
        : 'border-white/10 bg-white/5 text-slate-200';

  return (
    <div className={`mt-6 rounded-2xl border p-4 text-sm ${style}`} role={role} aria-live="polite">
      <p>{message}</p>
      {error && !error.canRetry ? (
        <p className="mt-2">Corrija a entrada e faça uma nova busca.</p>
      ) : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-xl border border-current px-3 py-2 font-medium transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-current/60"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
