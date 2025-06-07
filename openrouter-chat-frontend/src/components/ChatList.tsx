import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useErrorStore } from '../store/errorStore';
import { DocumentTextIcon } from '@heroicons/react/20/solid';
import { useCallback } from 'react';
import * as chatService from '../services/chatService';
import ChatListItem from './ChatListItem';

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
  const { addError } = useErrorStore();

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
    try {
      const updated = await chatService.renameChat(chatId, newName, authUser.token);
      renameChatInStore(chatId, updated.name);
    } catch (error) {
      addError({
        message: error instanceof Error ? error.message : 'Failed to rename chat',
      });
    }
  };

  const handleDelete = async (chatId: string) => {
    if (!authUser) return;
    setLoading(true);
    try {
      await chatService.deleteChat(chatId, authUser.token);
      deleteChatInStore(chatId);
    } catch (error) {
      addError({
        message: error instanceof Error ? error.message : 'Failed to delete chat',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* Remove old Chats title, now handled in Sidebar */}
      <div className="flex flex-col justify-between mb-4">
        <button
          className="flex items-center justify-between px-3 py-2 mt-5 bg-theme-primary text-white rounded-md hover:bg-theme-primary focus:outline-none w-full cursor-pointer"
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
          <ChatListItem
            key={chat.id}
            chatId={chat.id}
            name={chat.name}
            selected={chat.id === currentChatId}
            onClick={handleChatClick}
            onEdit={handleRename}
            onDelete={handleDelete}
            // Pass style props for restyling
            className="w-full px-3 py-2 rounded bg-theme-surface-100 hover:bg-theme-surface-200 transition-colors duration-100 text-theme-primary text-sm font-medium cursor-pointer flex items-center min-h-[36px] h-9"
          />
        ))}
      </ul>
    </div>
  );
};

// TODO: Remove blue focus ring and background highlight from menu popover and items. Use only theme border and background for focus/active states.

export default ChatList;
