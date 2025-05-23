import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { DocumentTextIcon } from '@heroicons/react/20/solid';
import { useCallback, useState } from 'react';
import { Menu } from '@headlessui/react';
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from '@heroicons/react/20/solid';
import * as chatService from '../services/chatService';

const ChatList = () => {
  const {
    chats,
    currentChatId,
    setCurrentChatId,
    setChats,
    setLoading,
    renameChat: renameChatInStore,
    deleteChat: deleteChatInStore,
  } = useChatStore();
  const authUser = useAuthStore((state) => state.authUser);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Handler for new chat using chatService
  const handleNewChat = useCallback(async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      setCurrentChatId(null);
    } catch (e) {
      // Optionally handle error (e.g., show toast)
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [authUser, chats, setChats, setCurrentChatId, setLoading]);

  const handleRename = async (chatId: string, newName: string) => {
    if (!authUser) return;
    setEditLoading(true);
    try {
      const updated = await chatService.renameChat(chatId, newName, authUser.token);
      renameChatInStore(chatId, updated.name);
      setEditingId(null);
    } catch (e) {
      // Optionally show error
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (chatId: string) => {
    if (!authUser) return;
    setLoading(true);
    try {
      await chatService.deleteChat(chatId, authUser.token);
      deleteChatInStore(chatId);
    } catch (e) {
      // Optionally show error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xs mx-auto p-4">
      <div className="flex flex-col justify-between mb-4">
        <h2 className="text-lg font-semibold text-theme-primary">Chats</h2>
        <button
          className="flex items-center justify-between px-3 py-2 mt-5 bg-theme-primary text-white rounded hover:bg-theme-primary focus:outline-none w-full cursor-pointer"
          onClick={handleNewChat}
          disabled={!authUser}
        >
          <span>New Chat</span>
          <DocumentTextIcon className="w-7 h-7 ml-2" />
        </button>
      </div>
      <ul className="space-y-1">
        {chats.length === 0 && (
          <li className="px-4 py-2 text-theme-secondary">No chats yet</li>
        )}
        {chats.map((chat) => (
          <li
            key={chat.id}
            className={`group flex items-center px-4 py-2 rounded cursor-pointer transition-colors relative ${
              chat.id === currentChatId
                ? 'bg-theme-surface text-theme-primary font-semibold border border-theme'
                : 'hover:bg-theme-surface text-theme-primary'
            }`}
            // Only select chat if not clicking menu or editing
            onClick={e => {
              if (editingId !== chat.id && !(e.target as HTMLElement).closest('.chat-menu')) {
                setCurrentChatId(chat.id);
              }
            }}
          >
            {editingId === chat.id ? (
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
                    if (editValue.trim() && !editLoading) handleRename(chat.id, editValue.trim());
                  } else if (e.key === 'Escape') {
                    setEditingId(null);
                  }
                }}
              />
            ) : (
              <>
                <span className="flex-1 truncate">{chat.name}</span>
                <Menu as="div" className="chat-menu relative inline-block text-left ml-2">
                  <Menu.Button
                    className="p-1 rounded hover:bg-theme-surface focus:outline-none"
                    onClick={e => e.stopPropagation()} // Prevent selecting chat
                  >
                    <EllipsisVerticalIcon className="w-5 h-5 text-theme-secondary" />
                  </Menu.Button>
                  <Menu.Items
                    // Popover to the right and bottom of the button
                    className="absolute left-full top-full ml-2 mt-0 w-36 origin-top-left rounded-md bg-theme-surface border border-theme shadow-lg focus:outline-none z-[9999]"
                  >
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`flex items-center w-full px-3 py-2 text-sm ${active ? 'bg-theme-background' : ''}`}
                            onClick={e => {
                              e.stopPropagation();
                              setEditingId(chat.id);
                              setEditValue(chat.name);
                            }}
                          >
                            <PencilIcon className="w-4 h-4 mr-2 text-theme-secondary" /> Rename
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`flex items-center w-full px-3 py-2 text-sm text-red-600 ${active ? 'bg-theme-background' : ''}`}
                            onClick={e => {
                              e.stopPropagation();
                              handleDelete(chat.id);
                            }}
                          >
                            <TrashIcon className="w-4 h-4 mr-2" /> Delete
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Menu>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

// TODO: Remove blue focus ring and background highlight from menu popover and items. Use only theme border and background for focus/active states.

export default ChatList;
