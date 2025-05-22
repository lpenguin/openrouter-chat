import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useAuthStore } from '../store/authStore';
import * as settingsService from '../services/settingsService';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import type { Settings } from '../schemas/settingsSchema';

const THEMES = [
  { value: 'github', label: 'GitHub (Default)' },
  { value: 'pastel-brown', label: 'Pastel Brown' },
  { value: 'pastel-teal', label: 'Pastel Teal' },
  { value: 'pastel-lavender', label: 'Pastel Lavender' },
  { value: 'pastel-sage', label: 'Pastel Sage' },
];

export default function SettingsDialog({ open, onClose }: {
  open: boolean;
  onClose: () => void;
}) {
  const authUser = useAuthStore((state) => state.authUser);
  if (!authUser) return null;

  const { settings, setSettings } = useSettingsStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState(settings?.operouter.token || '');
  const [theme, setTheme] = useState(settings?.theme || 'github');

  useEffect(() => {
    if (settings) {
      setToken(settings.operouter.token);
      setTheme(settings.theme);
    }
  }, [settings]);


  function handleSave() {
    if (!authUser) return;
  
    setSaving(true);
    setError(null);
    try {
      const newSettings: Settings = { operouter: { token }, theme };
      setSettings(newSettings);
      settingsService.saveSettings(authUser.token, newSettings);
      onClose();
    } catch (e) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          {/* Brighter and more transparent overlay */}
          <div className="fixed inset-0 bg-white bg-opacity-60 transition-opacity backdrop-blur-sm" />
        </TransitionChild>
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-visible rounded-lg bg-theme-surface p-6 text-left align-middle shadow-xl transition-all border border-theme">
                <DialogTitle as="h3" className="text-lg font-medium leading-6 text-theme-primary mb-4">
                  Settings
                </DialogTitle>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-theme-primary mb-1">OpenRouter Token</label>
                  <input
                    type="text"
                    className="w-full border border-theme rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-background text-theme-primary placeholder:text-theme-secondary"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                  />
                </div>
                <div className="mb-4 z-50">
                  <label className="block text-sm font-medium text-theme-primary mb-1">Theme</label>
                  <Listbox value={theme} onChange={setTheme}>
                    <div className="relative">
                      <ListboxButton className="w-full border border-theme rounded px-3 py-2 bg-theme-background text-theme-primary flex justify-between items-center">
                        <span>{THEMES.find(t => t.value === theme)?.label}</span>
                        <svg className="w-4 h-4 ml-2 text-theme-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20"><path strokeLinecap="round" strokeLinejoin="round" d="M6 8l4 4 4-4" /></svg>
                      </ListboxButton>
                      <ListboxOptions className="absolute left-0 right-0 mt-1 max-h-60 overflow-auto rounded bg-theme-surface border border-theme shadow-2xl z-[100]">
                        {THEMES.map(t => (
                          <ListboxOption
                            key={t.value}
                            value={t.value}
                            className={({ active, selected }) =>
                              `cursor-pointer select-none px-4 py-2 ${
                                selected ? 'font-bold text-theme-primary' : 'text-theme-primary'
                              } ${active ? 'bg-theme-background' : ''}`
                            }
                          >
                            {t.label}
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    </div>
                  </Listbox>
                </div>
                {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-theme-surface text-theme-primary hover:bg-theme-background border border-theme"
                    onClick={onClose}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-theme-primary text-white hover:bg-theme-success"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    Save
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
