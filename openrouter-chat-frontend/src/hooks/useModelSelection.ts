import { useState, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useSettingsStore } from '../store/settingsStore';

interface UseModelSelectionReturn {
  model: string | null;
  setModel: (model: string) => void;
}

export function useModelSelection(currentChatId: string | null): UseModelSelectionReturn {
  const { getChatById } = useChatStore();
  const { settings } = useSettingsStore();
  const [model, setModel] = useState<string | null>(null);

  useEffect(() => {
    if (currentChatId) {
      const currentChat = getChatById(currentChatId);
      if (currentChat) {
        setModel(currentChat.model);
      }
    } else {
      // Use default model from settings if available
      setModel(settings?.defaultModel || 'openai/gpt-3.5-turbo');
    }
  }, [currentChatId, getChatById, settings]);

  return {
    model,
    setModel,
  };
}
