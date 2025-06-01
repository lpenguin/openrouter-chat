import { useEffect, useState } from 'react';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import { useAuthStore } from './store/authStore';
import { useChatStore } from './store/chatStore';
import * as chatService from './services/chatService';

// Hook to detect if screen is mobile size
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}

function App() {
  const authUser = useAuthStore((state) => state.authUser);
  if (!authUser) return null;

  const { setCurrentChatId, setChats, setLoading } = useChatStore();
  const isMobile = useIsMobile();
  const [sidebarVisible, setSidebarVisible] = useState(false); // Start closed for both mobile and desktop initially

  // Set sidebar visibility based on screen size
  useEffect(() => {
    setSidebarVisible(!isMobile); // Open on desktop, closed on mobile
  }, [isMobile]);

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

  const toggleSidebar = () => {
    setSidebarVisible(prev => !prev);
  };

  return (
    <div className="bg-white text-gray-900 min-h-screen relative">
      {/* Mobile backdrop overlay */}
      {isMobile && sidebarVisible && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Layout container */}
      <div className="flex flex-row min-h-screen">
        <Sidebar 
          user={authUser} 
          onClose={toggleSidebar} 
          isVisible={sidebarVisible}
          isMobile={isMobile}
        />
        <Chat 
          sidebarVisible={sidebarVisible}
          onToggleSidebar={toggleSidebar}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}

export default App;
