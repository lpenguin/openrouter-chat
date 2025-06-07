import { settingsSchema, Settings } from '../schemas/settingsSchema';
import { httpClient, HttpError } from './httpClient';

export async function fetchSettings(token: string): Promise<Settings | null> {
  httpClient.setAuthToken(token);
  try {
    const data = await httpClient.get<{ settings: any }>('/settings');
    return settingsSchema.parse(data.settings);
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.status === 401) {
        throw new Error('Your session has expired. Please sign in again.');
      }
      if (error.status === 404) {
        // Settings not found is acceptable, return null
        return null;
      }
      // For other errors, return null to gracefully handle
      console.warn('Failed to fetch settings:', error.userMessage);
      return null;
    }
    console.warn('Failed to fetch settings:', error);
    return null;
  } finally {
    httpClient.clearAuthToken();
  }
}

export async function saveSettings(token: string, settings: Settings): Promise<boolean> {
  httpClient.setAuthToken(token);
  try {
    await httpClient.post<{ success: boolean }>('/settings', settings);
    return true;
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.status === 401) {
        throw new Error('Your session has expired. Please sign in again.');
      }
      if (error.status === 400) {
        throw new Error(error.responseBody?.error || 'Invalid settings data.');
      }
      throw new Error(error.userMessage);
    }
    throw error;
  } finally {
    httpClient.clearAuthToken();
  }
}
