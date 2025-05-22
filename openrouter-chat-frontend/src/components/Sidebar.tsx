import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import ChevronDownIcon from '@heroicons/react/20/solid/ChevronDownIcon.js';
import type { AuthUser } from '../schemas/authUserSchema';
import SettingsDialog from './SettingsDialog';
import { useState } from 'react';
import ChatList from './ChatList';

export default function Sidebar({ user }: { user: AuthUser }) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  function handleOpenSettings() {
    setSettingsOpen(true);
  }

  function handleLogout() {
    localStorage.removeItem('user');
    window.location.reload();
  }

  return (
    <aside className="flex flex-col justify-between h-screen w-56 bg-theme-surface border-theme border-r shadow-sm p-4">
      <div>
        <ChatList />
      </div>
      <div className="mb-2 flex justify-end">
        <Menu as="div" className="relative inline-block text-right w-auto">
          <MenuButton className="flex flex-row-reverse items-center gap-2 px-3 py-2 rounded bg-theme-background shadow hover:bg-theme-surface text-theme-primary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-theme-primary">
            <span className="truncate max-w-[120px]">{user.user.email}</span>
            <ChevronDownIcon className="w-4 h-4 text-theme-secondary ml-1" />
          </MenuButton>
          <MenuItems className="absolute right-0 bottom-full mb-2 w-40 origin-bottom-right bg-theme-surface border border-theme rounded shadow-lg focus:outline-none z-10">
            <div className="py-1">
              <MenuItem>
                {({ active }) => (
                  <button
                    onClick={handleOpenSettings}
                    className={`w-full text-left px-4 py-2 text-sm text-theme-primary hover:bg-theme-background ${active ? 'bg-theme-background' : ''}`}
                  >
                    Settings
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={`w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-theme-background ${active ? 'bg-theme-background' : ''}`}
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
        />
      </div>
    </aside>
  );
}
