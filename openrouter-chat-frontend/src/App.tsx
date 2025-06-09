import { useEffect, useRef, useState } from 'react';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import ErrorToastContainer from './components/ErrorToast';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuthStore } from './store/authStore';
import { useChatStore } from './store/chatStore';
import { useErrorStore } from './store/errorStore';
import { setGlobalLogoutCallback } from './services/httpClient';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
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

// Sync currentChatId with route param only (no chat loading here)
function ChatRouteSync(props: { sidebarVisible: boolean; toggleSidebar: () => void; isMobile: boolean }) {
  const { sidebarVisible, toggleSidebar, isMobile } = props;
  const { chatId: urlChatId } = useParams<{ chatId?: string }>();
  const setCurrentChatId = useChatStore((state) => state.setCurrentChatId);
  const currentChatId = useChatStore((state) => state.currentChatId);
  const prevChatId = useRef<string | null>(null);
  
  useEffect(() => {
    if (urlChatId !== undefined && !currentChatId && prevChatId.current === null) {
      setCurrentChatId(urlChatId);
    }
    prevChatId.current = currentChatId;
  }, [urlChatId, currentChatId, setCurrentChatId]);
  return (
    <Chat
      sidebarVisible={sidebarVisible}
      onToggleSidebar={toggleSidebar}
      isMobile={isMobile}
    />
  );
}

function AppInner() {
  const authUser = useAuthStore((state) => state.authUser);
  const { setAuthUser } = useAuthStore();
  const { addError } = useErrorStore();
  const setCurrentChatId = useChatStore((state) => state.setCurrentChatId);
  const currentChatId = useChatStore((state) => state.currentChatId);
  const setChats = useChatStore((state) => state.setChats);
  const setLoading = useChatStore((state) => state.setLoading);
  const isMobile = useIsMobile();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  useNetworkStatus();
  const navigate = useNavigate();

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
    return () => setGlobalLogoutCallback(null);
  }, [setAuthUser, addError]);

  useEffect(() => {
    setSidebarVisible(!isMobile);
  }, [isMobile]);

  // On login, load chats or create a new one using populateChatStore
  useEffect(() => {
    if (!authUser) return;
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
  }, [authUser, setChats, setLoading, setCurrentChatId, addError]);



  // Update the route when currentChatId changes
  useEffect(() => {
    // Only update if the route does not match the currentChatId
    const path = window.location.pathname;
    const expected = currentChatId ? `/${currentChatId}` : '/';
    if (path !== expected) {
      console.log('Navigating to', expected, 'from', path);
      navigate(expected, { replace: true });
    }
  }, [currentChatId, navigate]);

  const toggleSidebar = () => {
    setSidebarVisible(prev => !prev);
  };

  if (!authUser) return null;

  return (
    <div className="bg-white text-gray-900 relative">
      {isMobile && sidebarVisible && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      <div className="flex flex-row min-h-[100svh]">
        <Sidebar
          user={authUser!}
          onClose={toggleSidebar}
          isVisible={sidebarVisible}
          isMobile={isMobile}
        />
        <Routes>
          <Route path="/:chatId" element={
            <ChatRouteSync
              sidebarVisible={sidebarVisible}
              toggleSidebar={toggleSidebar}
              isMobile={isMobile}
               />
          } />
          <Route path="/" element={
            <ChatRouteSync
              sidebarVisible={sidebarVisible}
              toggleSidebar={toggleSidebar}
              isMobile={isMobile}
             />
            } />
        </Routes>
      </div>
      <ErrorToastContainer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
