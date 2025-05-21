import { useEffect } from 'react';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import { useAuthStore } from './store/authStore';
import { useChatStore } from './store/chatStore';
import * as chatService from './services/chatService';


function App() {
  const authUser = useAuthStore((state) => state.authUser);
  const { currentChatId, setChats, setCurrentChatId, setLoading } = useChatStore();
  // On login, load chats or create a new one using populateChatStore
  useEffect(() => {
    if (!authUser) return;
    (async () => {
      setLoading(true);
      // Always create a new chat, regardless of existing chats
      const chat = await chatService.createChat(authUser.token);
      setChats([chat]);
      setCurrentChatId(chat.id);
      setLoading(false);
    })();
  }, [authUser, setChats, setCurrentChatId, setLoading]);

  return (
    <div className="bg-white text-gray-900 min-h-screen flex flex-row">
      <Sidebar user={authUser!!} />
      {currentChatId ? (
        <Chat
          chatUuid={currentChatId}
        />
      ) : null}
    </div>
  );
}

export default App;
