import React from 'react';
import { useErrorStore } from '../store/errorStore';

/**
 * Test component for verifying error handling functionality.
 * This component should be removed after testing is complete.
 */
const ErrorTestComponent: React.FC = () => {
  const { addError } = useErrorStore();

  const testGeneralError = () => {
    addError({
      title: 'Test Error',
      message: 'This is a test general error',
    });
  };

  const testAuthError = () => {
    addError({
      title: 'Authentication Error',
      message: 'Unauthorized access',
    });
  };

  const testNetworkError = () => {
    addError({
      title: 'Network Error',
      message: 'Failed to fetch',
    });
  };

  const testValidationError = () => {
    addError({
      title: 'Validation Error',
      message: 'Invalid input provided',
    });
  };

  const testErrorBoundary = () => {
    throw new Error('This error will be caught by ErrorBoundary');
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50">
      <h3 className="text-sm font-semibold mb-3 text-gray-800">Error Testing</h3>
      <div className="space-y-2">
        <button
          onClick={testGeneralError}
          className="block w-full text-left px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded"
        >
          Test General Error
        </button>
        <button
          onClick={testAuthError}
          className="block w-full text-left px-2 py-1 text-xs bg-red-100 hover:bg-red-200 rounded"
        >
          Test Auth Error
        </button>
        <button
          onClick={testNetworkError}
          className="block w-full text-left px-2 py-1 text-xs bg-orange-100 hover:bg-orange-200 rounded"
        >
          Test Network Error
        </button>
        <button
          onClick={testValidationError}
          className="block w-full text-left px-2 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 rounded"
        >
          Test Validation Error
        </button>
        <button
          onClick={testErrorBoundary}
          className="block w-full text-left px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 rounded"
        >
          Test Error Boundary
        </button>
      </div>
    </div>
  );
};

export default ErrorTestComponent;
