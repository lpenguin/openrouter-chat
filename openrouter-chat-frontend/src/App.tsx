import { useEffect, useState } from 'react'
import Chat from './components/Chat';
import ChatInput from './components/ChatInput'
import ModelSelector from './components/ModelSelector';
import type { Message } from './types/chat';
import { fetchMessages, sendMessage } from './services/chatService';

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchMessages().then(setMessages)
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
    <div className="bg-white text-gray-900 min-h-screen flex flex-col">
      <div className="flex flex-col flex-1 min-h-0 w-full">
        <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col">
          <div className="py-4 self-end">
            <ModelSelector />
          </div>
          <Chat messages={messages} loading={loading} />
          <ChatInput onSend={handleSend} disabled={loading} />
        </div>
      </div>
    </div>
  )
}

export default App
