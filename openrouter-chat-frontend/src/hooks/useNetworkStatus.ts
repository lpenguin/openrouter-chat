import { useState, useEffect } from 'react';
import { useErrorStore } from '../store/errorStore';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { addError } = useErrorStore();

  useEffect(() => {
    let reconnectNotified = false;

    const handleOnline = () => {
      setIsOnline(true);
      // Only show "Back online" message if we were offline
      if (!reconnectNotified) {
        reconnectNotified = true;
        addError({
          message: 'Connection restored',
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      reconnectNotified = false;
      addError({
        message: 'You are currently offline. Some features may not work.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addError]);

  return isOnline;
}
