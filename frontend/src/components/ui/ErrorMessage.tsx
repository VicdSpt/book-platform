import React from 'react';

interface Props {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<Props> = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
    <p className="text-red-600 mb-2">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-sm text-red-600 underline hover:no-underline"
      >
        Try again
      </button>
    )}
  </div>
);

export default ErrorMessage;