import { useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useErrorStore } from '../store/errorStore';
import { DocumentTextIcon } from '@heroicons/react/20/solid';
import * as chatService from '../services/chatService';
import ChatListItem from './ChatListItem';
import type { Chat } from '../types/chat';

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

function isThisWeek(date: dayjs.Dayjs): boolean {
  const now = dayjs();
  const startOfWeek = now.startOf('week').add(1, 'day');
  const endOfWeek = startOfWeek.add(6, 'day');
  return date.isSameOrAfter(startOfWeek, 'day') && date.isSameOrBefore(endOfWeek, 'day');
}

const groupChatsByDate = (chats: Chat[]): Record<string, Chat[]> => {
  const groups: Record<string, Chat[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    Past: [],
  };
  for (const chat of chats) {
    const date = dayjs(chat.updated_at || chat.created_at);
    if (date.isToday()) {
      groups.Today.push(chat);
    } else if (date.isYesterday()) {
      groups.Yesterday.push(chat);
    } else if (isThisWeek(date)) {
      groups['This Week'].push(chat);
    } else {
      groups.Past.push(chat);
    }
  }
  return groups;
};

interface ChatListProps {
  className?: string;
}

const ChatList = ({ className = '' }: ChatListProps) => {
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

  // Sort and group chats
  const groupedChats = useMemo(() => {
    const sorted = [...chats].sort((a, b) => {
      const aDate = dayjs(a.updated_at || a.created_at);
      const bDate = dayjs(b.updated_at || b.created_at);
      return bDate.valueOf() - aDate.valueOf();
    });
    return groupChatsByDate(sorted);
  }, [chats]);

  return (
    <div className={`flex flex-col w-full max-w-xs mx-auto ${className}`}>
      <button
        className="flex items-center justify-between px-3 py-2 mb-4 bg-theme-primary text-white rounded-md hover:bg-theme-primary focus:outline-none w-full cursor-pointer"
        onClick={handleNewChat}
        disabled={!authUser}
      >
        <span>New Chat</span>
        <DocumentTextIcon className="w-7 h-7 ml-2" />
      </button>
      <ul className="space-y-1 min-h-0 overflow-y-auto flex-1">
        {Object.entries(groupedChats).every(([, arr]) => arr.length === 0) && (
          <li className="px-4 py-2 text-theme-secondary">No chats yet</li>
        )}
        {Object.entries(groupedChats).map(([group, arr]) =>
          arr.length > 0 ? (
            <li key={group}>
              <div className="py-1 text-xs font-semibold text-theme-secondary uppercase tracking-wider">{group}</div>
              <ul className="space-y-1">
                {arr.map((chat) => (
                  <ChatListItem
                    key={chat.id}
                    chatId={chat.id}
                    name={chat.name}
                    selected={chat.id === currentChatId}
                    onClick={handleChatClick}
                    onEdit={handleRename}
                    onDelete={handleDelete}
                    className="w-full ml-1 pl-2 pr-2 py-0  min-h-8 h-0 rounded bg-theme-surface-100 hover:bg-theme-surface-200 transition-colors duration-100 text-theme-primary text-sm font-medium cursor-pointer flex items-center"
                  />
                ))}
              </ul>
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
};

// TODO: Remove blue focus ring and background highlight from menu popover and items. Use only theme border and background for focus/active states.

export default ChatList;
