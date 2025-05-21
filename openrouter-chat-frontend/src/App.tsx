import { useEffect, useState } from 'react';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import type { Message } from './types/chat';
import { fetchMessages, sendMessage } from './services/chatService';
import { useAuthStore } from './store/authStore';

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const authUser = useAuthStore((state) => state.authUser);

  useEffect(() => {
    fetchMessages().then(setMessages)
    // No need to set authUser here, handled globally
  }, [])

  const handleSend = async (content: string) => {
    setLoading(true)
    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content,
    }
    setMessages(prev => [...prev, userMsg])
    const reply = await sendMessage(content)
    setMessages(prev => [...prev, reply])
    setLoading(false)
  }

  return (
      <div className="bg-white text-gray-900 min-h-screen flex flex-row">
        <Sidebar user={authUser?.user!!} />
        <Chat
          messages={messages}
          loading={loading}
          onSend={handleSend}
        />
      </div>
  )
}

export default App
