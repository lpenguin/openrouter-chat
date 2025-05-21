import { create } from 'zustand';
import { Chat, Message } from '../schemas/chatSchema';

interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  messages: Message[];
  loading: boolean;
  setChats: (chats: Chat[]) => void;
  getChatById: (id: string) => Chat | null;
  setChatById: (id: string, chat: Chat) => void;
  setCurrentChatId: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  setLoading: (loading: boolean) => void;
  addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChatId: null,
  messages: [],
  loading: false,
  getChatById: (id) => {
    const chat = get().chats.find((chat) => chat.id === id);
    return chat || null;
  },
  setChatById: (id, chat) => {
    set((state) => ({
      chats: state.chats.map((c) => (c.id === id ? chat : c)),
    }));
  },
  setChats: (chats) => set({ chats }),
  setCurrentChatId: (currentChatId) => set({ currentChatId }),
  setMessages: (messages) => set({ messages }),
  setLoading: (loading) => set({ loading }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
}));
