import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import AuthGate from './components/AuthGate.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { getUser } from './services/userService';
import { useAuthStore } from './store/authStore';
import { Theme } from './components/Theme';
import { SettingsLoader } from './components/SettingsLoader';

// Load user from localStorage and set in store before rendering App
const storedUser = getUser();
if (storedUser) {
  // Set both authUser and token in the store
  useAuthStore.getState().setAuthUser(storedUser);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <SettingsLoader>
        <Theme>
          <AuthGate>
            <App />
          </AuthGate>
        </Theme>
      </SettingsLoader>
    </ErrorBoundary>
  </StrictMode>,
);
