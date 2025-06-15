import { create } from 'zustand';
import { Chat, Message } from '../types/chat';


interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  loading: boolean;
  addChat: (chat: Chat) => void;
  setChats: (chats: Chat[]) => void;
  getChatById: (id: string) => Chat | null;
  setChatById: (id: string, chat: Chat) => void;
  setCurrentChatId: (currentChatId: string | null) => void;
  setLoading: (loading: boolean) => void;
  replaceChat: (chatId: string, chat: Chat) => void;
  renameChat: (chatId: string, name: string) => void;
  deleteChat: (chatId: string) => void;
  updateChatUpdatedAt: (chatId: string, updatedAt: string | Date) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChatId: null,
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
  setLoading: (loading) => set({ loading }),
  updateChatUpdatedAt: (chatId: string, updatedAt: string | Date) => set((state) => ({
    chats: state.chats.map((chat) =>
      chat.id === chatId ? { ...chat, updated_at: updatedAt } : chat
    ),
  })),
  replaceChat: (chatId, chat) => set((state) => ({
    chats: state.chats.map((c) => (c.id === chatId ? chat : c)),
  })),
  addChat: (chat) => set((state) => ({ chats: [...state.chats, chat]  })),
  renameChat: (chatId, name) => set((state) => ({
    chats: state.chats.map((c) => (c.id === chatId ? { ...c, name } : c)),
  })),
  deleteChat: (chatId) => set((state) => ({
    chats: state.chats.filter((c) => c.id !== chatId),
    // Clear currentChatId if the deleted chat was active
    currentChatId: state.currentChatId === chatId ? null : state.currentChatId,
  })),
}));
