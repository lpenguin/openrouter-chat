import AuthGate from './components/AuthGate';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import { useEffect, useState } from 'react';
import type { Message } from './types/chat';
import { fetchMessages, sendMessage } from './services/chatService';

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    fetchMessages().then(setMessages)
    // Get user email from localStorage
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setUserEmail(user.email || '');
      } catch {}
    }
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
    <AuthGate>
      <div className="bg-white text-gray-900 min-h-screen flex flex-row">
        <Sidebar email={userEmail} />
        <Chat
          messages={messages}
          loading={loading}
          onSend={handleSend}
        />
      </div>
    </AuthGate>
  )
}

export default App
