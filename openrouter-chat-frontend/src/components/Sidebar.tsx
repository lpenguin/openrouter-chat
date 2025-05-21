import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import ChevronDownIcon from '@heroicons/react/20/solid/ChevronDownIcon.js';
import type { AuthUser } from '../schemas/authUserSchema';
import SettingsDialog from './SettingsDialog';
import { useState } from 'react';
import { fetchSettings, saveSettings } from '../services/settingsService';
import { Settings } from '../schemas/settingsSchema';

export default function Sidebar({ user }: { user: AuthUser }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({ operouter: { token: '' } });

  async function handleOpenSettings() {
    if (user.token) {
      const loaded = await fetchSettings(user.token);
      setSettings(loaded || { operouter: { token: '' } });
    }
    setSettingsOpen(true);
  }

  async function handleSaveSettings(newSettings: Settings) {
    if (user.token) {
      await saveSettings(user.token, newSettings);
      setSettings(newSettings);
    }
  }

  function handleLogout() {
    localStorage.removeItem('user');
    window.location.reload();
  }

  return (
    <aside className="flex flex-col justify-between h-screen w-56 bg-gray-100 border-r shadow-sm p-4">
      <div />
      <div className="mb-2 flex justify-end">
        <Menu as="div" className="relative inline-block text-right w-auto">
          <MenuButton className="flex flex-row-reverse items-center gap-2 px-3 py-2 rounded bg-white shadow hover:bg-gray-50 text-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
            <span className="truncate max-w-[120px]">{user.user.email}</span>
            <ChevronDownIcon className="w-4 h-4 text-gray-400 ml-1" />
          </MenuButton>
          <MenuItems className="absolute right-0 bottom-full mb-2 w-40 origin-bottom-right bg-white border border-gray-200 rounded shadow-lg focus:outline-none z-10">
            <div className="py-1">
              <MenuItem>
                {({ active }) => (
                  <button
                    onClick={handleOpenSettings}
                    className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${active ? 'bg-gray-100' : ''}`}
                  >
                    Settings
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={`w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 ${active ? 'bg-gray-100' : ''}`}
                  >
                    Logout
                  </button>
                )}
              </MenuItem>
            </div>
          </MenuItems>
        </Menu>
        <SettingsDialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          initialSettings={settings}
          onSave={handleSaveSettings}
        />
      </div>
    </aside>
  );
}
