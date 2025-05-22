import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { DocumentTextIcon } from '@heroicons/react/20/solid';
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
      setCurrentChatId(null);
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
            className={`px-4 py-2 rounded cursor-pointer transition-colors ${
              chat.id === currentChatId
                ? 'bg-theme-surface text-theme-primary font-semibold border border-theme'
                : 'hover:bg-theme-surface text-theme-primary'
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
