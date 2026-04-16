interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
      <p className="text-red-600 text-sm" data-testid="error-message">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          data-testid="retry-button"
        >
          Try again
        </button>
      )}
    </div>
  );
}
