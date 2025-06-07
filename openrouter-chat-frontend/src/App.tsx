import { useEffect, useState } from 'react';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import ErrorToastContainer from './components/ErrorToast';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuthStore } from './store/authStore';
import { useChatStore } from './store/chatStore';
import { useErrorStore } from './store/errorStore';
import { setGlobalLogoutCallback } from './services/httpClient';
import { useNetworkStatus } from './hooks/useNetworkStatus';
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
  const { setAuthUser } = useAuthStore();
  const { addError } = useErrorStore();
  
  // Initialize network status monitoring (no need to store the value)
  useNetworkStatus();
  
  if (!authUser) return null;

  const { setCurrentChatId, setChats, setLoading } = useChatStore();
  const isMobile = useIsMobile();
  const [sidebarVisible, setSidebarVisible] = useState(false); // Start closed for both mobile and desktop initially

  // Set up global logout callback for HTTP client
  useEffect(() => {
    const logoutCallback = () => {
      setAuthUser(null);
      addError({
        title: 'Session Expired',
        message: 'Session expired',
      });
    };
    
    setGlobalLogoutCallback(logoutCallback);
    
    // Cleanup on unmount
    return () => setGlobalLogoutCallback(null);
  }, [setAuthUser, addError]);

  // Set sidebar visibility based on screen size
  useEffect(() => {
    setSidebarVisible(!isMobile); // Open on desktop, closed on mobile
  }, [isMobile]);

  // On login, load chats or create a new one using populateChatStore
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const chats = await chatService.getChats(authUser.token);
        setChats(chats);
        setCurrentChatId(null);
      } catch (error) {
        addError({
          title: 'Failed to Load Chats',
          message: error instanceof Error ? error.message : 'Failed to load chats',
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [authUser, setChats, setLoading, addError]);

  const toggleSidebar = () => {
    setSidebarVisible(prev => !prev);
  };

  return (
    <ErrorBoundary>
      <div className="bg-white text-gray-900 relative">
        {/* Mobile backdrop overlay */}
        {isMobile && sidebarVisible && (
          <div 
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={toggleSidebar}
          />
        )}
        
        {/* Layout container */}
        <div className="flex flex-row min-h-[100svh]">
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
        
        {/* Global Error Toast Container */}
        <ErrorToastContainer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
