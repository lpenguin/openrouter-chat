import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import ChevronDownIcon from '@heroicons/react/20/solid/ChevronDownIcon.js';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { AuthUser } from '../schemas/authUserSchema';
import SettingsDialog from './SettingsDialog';
import { useState } from 'react';
import ChatList from './ChatList';

interface SidebarProps {
  user: AuthUser;
  onClose?: () => void;
  isVisible: boolean;
  isMobile: boolean;
}

export default function Sidebar({ user, onClose, isVisible, isMobile }: SidebarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  function handleOpenSettings() {
    setSettingsOpen(true);
  }

  function handleLogout() {
    localStorage.removeItem('user');
    window.location.reload();
  }

  return (
    <aside 
      className={`
        flex flex-col justify-between min-h-[100svh] bg-theme-surface border-theme transition-all duration-300 ease-in-out overflow-visible
        ${isMobile 
          ? `fixed top-0 left-0 z-50 transform ${isVisible ? 'translate-x-0' : '-translate-x-full'} w-64 border-r shadow-lg`
          : `${isVisible ? 'w-56 opacity-100 p-4 border-r shadow-sm z-50' : 'w-0 opacity-0 p-0 border-r-0 shadow-none'}`
        }
      `}
    >
      <div className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Close button - only show if onClose is provided */}
        {onClose && isVisible && (
          <div className="flex justify-end mb-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-theme-surface-200 rounded-md transition-colors"
              aria-label="Hide sidebar"
            >
              <XMarkIcon className="w-5 h-5 text-theme-secondary" />
            </button>
          </div>
        )}
        {isVisible && <ChatList />}
      </div>
      <div className={`mb-2 flex justify-end transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {isVisible && (
          <Menu as="div" className="relative inline-block text-right w-auto">
            <MenuButton className="flex flex-row-reverse items-center gap-2 px-3 py-2 rounded bg-theme-background shadow hover:bg-theme-surface text-theme-primary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-theme-primary cursor-pointer">
              <span className="truncate max-w-[120px]">{user.user.email}</span>
              <ChevronDownIcon className="w-4 h-4 text-theme-secondary ml-1" />
            </MenuButton>
            <MenuItems className="absolute right-0 bottom-full mb-2 w-40 origin-bottom-right bg-theme-surface rounded shadow-lg focus:outline-none z-10">
              <div className="py-1">
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={handleOpenSettings}
                      className={`w-full text-left px-4 py-2 text-sm text-theme-primary hover:bg-theme-background ${active ? 'bg-theme-background' : ''} cursor-pointer`}
                    >
                      Settings
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-theme-background ${active ? 'bg-theme-background' : ''} cursor-pointer`}
                    >
                      Logout
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        )}
        {isVisible && (
          <SettingsDialog
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          />
        )}
      </div>
    </aside>
  );
}
