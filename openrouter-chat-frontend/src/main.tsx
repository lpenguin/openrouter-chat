import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AuthGate from './components/AuthGate.tsx'
import { getUser } from './services/userService'
import { useAuthStore } from './store/authStore'

// Load user from localStorage and set in store before rendering App
const storedUser = getUser();
if (storedUser) {
  // Set both authUser and token in the store
  useAuthStore.getState().setAuthUser(storedUser);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthGate>
      <App />
    </AuthGate>
  </StrictMode>,
)
