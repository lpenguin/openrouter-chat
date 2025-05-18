import { useEffect, useState } from 'react'
import { Theme, Flex } from '@radix-ui/themes';
import Chat from './components/Chat';
import ChatInput from './components/ChatInput'
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
    <Theme appearance="light" accentColor="blue">
      <Flex direction="column" style={{ height: '100vh' }}>
        <Flex direction="column" style={{ flex: 1, minHeight: 0, width: '100%' }}>
          <div style={{ width: '100%', maxWidth: '760px', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Chat messages={messages} loading={loading} />
            <ChatInput onSend={handleSend} disabled={loading} />
          </div>
        </Flex>
      </Flex>
    </Theme>
  )
}

export default App
