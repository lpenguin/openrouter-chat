import { useEffect } from 'react';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import { useAuthStore } from './store/authStore';
import { useChatStore } from './store/chatStore';
import * as chatService from './services/chatService';


function App() {
  const authUser = useAuthStore((state) => state.authUser);
  if (!authUser) return null;

  const { setCurrentChatId, setChats, setLoading } = useChatStore();
  // On login, load chats or create a new one using populateChatStore
  useEffect(() => {
    (async () => {
      setLoading(true);
      const chats = await chatService.getChats(authUser.token);
      setChats(chats);
      setCurrentChatId(null);
      setLoading(false);
    })();
  }, [authUser, setChats, setLoading]);

  return (
    <div className="bg-white text-gray-900 min-h-screen flex flex-row">
      <Sidebar user={authUser} />
      <Chat />
    </div>
  );
}

export default App;
