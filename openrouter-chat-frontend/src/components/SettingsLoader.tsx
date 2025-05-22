import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { fetchSettings } from '../services/settingsService';

export function SettingsLoader({ children }: { children: React.ReactNode }) {
  const authUser = useAuthStore(s => s.authUser);
  const setSettings = useSettingsStore(s => s.setSettings);

  useEffect(() => {
    if (!authUser) return;
    (async () => {
      const settings = await fetchSettings(authUser.token);
      if (settings) setSettings(settings);
    })();
  }, [authUser, setSettings]);

  return <>{children}</>;
}
