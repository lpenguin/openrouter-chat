import { settingsSchema, Settings } from '../schemas/settingsSchema';
import { API_BASE_URL } from '../config/api';

export async function fetchSettings(token: string): Promise<Settings | null> {
  const res = await fetch(`${API_BASE_URL}/settings`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) return null;
  const data = await res.json();
  try {
    return settingsSchema.parse(data.settings);
  } catch {
    return null;
  }
}

export async function saveSettings(token: string, settings: Settings): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/settings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(settings),
  });
  return res.ok;
}
