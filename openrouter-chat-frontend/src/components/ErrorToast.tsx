import React, { useEffect } from 'react';
import { useErrorStore, AppError } from '../store/errorStore';
import { XMarkIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface ErrorToastProps {
  error: AppError;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ error }) => {
  const removeError = useErrorStore((state) => state.removeError);

  // Auto-dismiss after 5 seconds (fixed duration)
  useEffect(() => {
    const timer = setTimeout(() => {
      removeError(error.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [error.id, removeError]);

  const getIcon = () => {
    // Use general error icon for all errors
    return <ExclamationCircleIcon className="w-5 h-5" />;
  };

  const getColorClasses = () => {
    // Use consistent error styling for all errors
    return 'bg-red-50 border-red-200 text-red-800';
  };

  const handleDismiss = () => {
    removeError(error.id);
  };

  return (
    <div className={`pointer-events-auto w-full min-w-lg overflow-hidden rounded-lg border shadow-lg ${getColorClasses()}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            {error.title && (
              <p className="text-sm font-medium">
                {error.title}
              </p>
            )}
            <p className={`text-sm ${error.title ? 'mt-1' : ''}`}>
              {error.message}
            </p>
            {error.details && (
              <p className="mt-2 text-xs opacity-75">
                {error.details}
              </p>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
                onClick={handleDismiss}
                className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-75"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="w-5 h-5" />
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ErrorToastContainer: React.FC = () => {
  const { errors, maxErrors } = useErrorStore();
  const hasMoreErrors = errors.length >= maxErrors;

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {errors.map((error) => (
        <ErrorToast key={error.id} error={error} />
      ))}
      {hasMoreErrors && (
        <div className="bg-gray-100 border border-gray-300 text-gray-700 px-3 py-2 rounded-md shadow-sm text-sm pointer-events-auto">
          <div className="flex items-center space-x-2">
            <InformationCircleIcon className="w-4 h-4" />
            <span>Showing latest {maxErrors} errors</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorToastContainer;
