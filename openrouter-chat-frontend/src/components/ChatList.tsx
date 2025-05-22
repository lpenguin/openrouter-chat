import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { PlusIcon } from '@heroicons/react/20/solid';
import * as chatService from '../services/chatService';
import { useCallback } from 'react';

const ChatList = () => {
  const {
    chats,
    currentChatId,
    setCurrentChatId,
    setChats,
    setLoading,
  } = useChatStore();
  const authUser = useAuthStore((state) => state.authUser);

  // Handler for new chat using chatService
  const handleNewChat = useCallback(async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      const newChat = await chatService.createChat(authUser.token);
      setChats([newChat, ...chats]);
      setCurrentChatId(newChat.id);
    } catch (e) {
      // Optionally handle error (e.g., show toast)
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [authUser, chats, setChats, setCurrentChatId, setLoading]);

  return (
    <div className="w-full max-w-xs mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Chats</h2>
        <button
          className="inline-flex items-center px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
          onClick={handleNewChat}
          disabled={!authUser}
        >
          <PlusIcon className="w-4 h-4 mr-1" /> New Chat
        </button>
      </div>
      <ul className="space-y-1">
        {chats.length === 0 && (
          <li className="px-4 py-2 text-gray-400">No chats yet</li>
        )}
        {chats.map((chat) => (
          <li
            key={chat.id}
            className={`px-4 py-2 rounded cursor-pointer transition-colors ${
              chat.id === currentChatId
                ? 'bg-blue-100 text-blue-900 font-semibold'
                : 'hover:bg-gray-200 text-gray-900'
            }`}
            onClick={() => setCurrentChatId(chat.id)}
          >
            {chat.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
