import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import ChevronDownIcon from '@heroicons/react/20/solid/ChevronDownIcon.js';
import type { AuthUser } from '../schemas/authUserSchema';

interface UserMenuProps {
  user: AuthUser;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export default function UserMenu({ user, onOpenSettings, onLogout }: UserMenuProps) {
  return (
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
                onClick={onOpenSettings}
                className={`w-full text-left px-4 py-2 text-sm text-theme-primary hover:bg-theme-background ${active ? 'bg-theme-background' : ''} cursor-pointer`}
              >
                Settings
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ active }) => (
              <button
                onClick={onLogout}
                className={`w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-theme-background ${active ? 'bg-theme-background' : ''} cursor-pointer`}
              >
                Logout
              </button>
            )}
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
}
