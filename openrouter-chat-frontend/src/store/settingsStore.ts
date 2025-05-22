import { create } from 'zustand';
import type { Settings } from '../schemas/settingsSchema';

interface SettingsStore {
  settings: Settings | null;
  setSettings: (settings: Settings) => void;
  setTheme: (theme: string) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: null,
  setSettings: (settings) => set({ settings }),
  setTheme: (theme) => set((state) => state.settings ? { settings: { ...state.settings, theme } } : {}),
}));