import { useState } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from '@heroicons/react/20/solid';

interface ChatListItemProps {
  chatId: string;
  name: string;
  selected: boolean;
  onClick: (chatId: string) => void;
  onEdit: (chatId: string, newName: string) => void;
  onDelete: (chatId: string) => void;
  className?: string; // Allow passing custom className
}

export default function ChatListItem({ 
  chatId, 
  name, 
  selected, 
  onClick, 
  onEdit, 
  onDelete, 
  className = '' 
}: ChatListItemProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const handleRename = async (newName: string) => {
    setEditLoading(true);
    try {
      await onEdit(chatId, newName);
      setEditingId(null);
    } catch (e) {
      // Optionally show error
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    await onDelete(chatId);
  };

  return (
    <li
      className={`group flex items-center cursor-pointer transition-colors relative hover:bg-theme-surface-200
        ${selected
          ? 'bg-theme-surface-300 hover:bg-theme-surface-300 text-theme-primary font-semibold'
          : 'bg-theme-surface-100 text-theme-primary'}
        ${className}`}
      style={{ marginBottom: '2px' }}
      // Only select chat if not clicking menu or editing
      onClick={e => {
        if (editingId !== chatId && !(e.target as HTMLElement).closest('.chat-menu')) {
          onClick(chatId);
        }
      }}
    >
      {editingId === chatId ? (
        <input
          className="flex-1 bg-theme-surface border-b border-theme outline-none text-theme-primary px-2 py-1 rounded transition-all duration-150 w-full min-w-0 max-w-full"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          autoFocus
          disabled={editLoading}
          maxLength={40}
          style={{ minWidth: 0 }}
          onBlur={() => setEditingId(null)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (editValue.trim() && !editLoading) handleRename(editValue.trim());
            } else if (e.key === 'Escape') {
              setEditingId(null);
            }
          }}
        />
      ) : (
        <>
          <span className="flex-1 truncate">{name}</span>
          <Menu as="div" className="chat-menu inline-block text-left ml-2">
            <MenuButton
              className="p-1 rounded hover:bg-theme-surface focus:outline-none"
              onClick={e => e.stopPropagation()} // Prevent selecting chat
            >
              <EllipsisVerticalIcon className="w-5 h-5 text-theme-secondary" />
            </MenuButton>
            <MenuItems
              // Popover to the right and bottom of the button
              anchor="bottom start"
              className="ml-2 mt-0 w-36 rounded-md bg-theme-surface border border-theme shadow-lg z-[9999]"
            >
              <div className="py-1">
                <MenuItem>
                  {({ focus }) => (
                    <button
                      className={`flex items-center w-full px-3 py-2 text-sm ${focus ? 'bg-theme-background' : ''}`}
                      onClick={e => {
                        e.stopPropagation();
                        setEditingId(chatId);
                        setEditValue(name);
                      }}
                    >
                      <PencilIcon className="w-4 h-4 mr-2 text-theme-secondary" /> Rename
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      className={`flex items-center w-full px-3 py-2 text-sm text-red-600 ${active ? 'bg-theme-background' : ''}`}
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                    >
                      <TrashIcon className="w-4 h-4 mr-2" /> Delete
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </>
      )}
    </li>
  );
}