import type { AuthUser } from '../schemas/authUserSchema';
import SettingsDialog from './SettingsDialog';
import SidebarCloseButton from './SidebarCloseButton';
import UserMenu from './UserMenu';
import { useState } from 'react';
import ChatList from './ChatList';

interface SidebarProps {
  user: AuthUser;
  onClose: () => void;
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
        flex flex-col justify-between h-[100svh] bg-theme-surface border-theme transition-all duration-300 ease-in-out overflow-visible
        ${isVisible ? 'z-50' : ''}
        ${isMobile 
          ? `fixed top-0 left-0 transform ${isVisible ? 'translate-x-0 w-64 border-r shadow-lg p-4' : '-translate-x-full'}`
          : isVisible ? 'w-64 opacity-100 p-4 border-r shadow-sm' : 'w-0 opacity-0 p-0 border-r-0 shadow-none'
        }
      `}
    >
      {isVisible && (
        <>
          <SidebarCloseButton onClose={onClose} />
          <ChatList 
            className='flex-1 min-h-0'
          />
          <UserMenu
              user={user}
              onOpenSettings={handleOpenSettings}
              onLogout={handleLogout}
            />
          <SettingsDialog
              open={settingsOpen}
              onClose={() => setSettingsOpen(false)}
            />
        </>
      )}
    </aside>
  );
}
