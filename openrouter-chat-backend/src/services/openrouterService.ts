import axios from 'axios';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  model?: string | null;
};

export async function getOpenRouterCompletion({
  messages,
  model,
  apiKey
}: {
  messages: ChatMessage[];
  model: string;
  apiKey: string;
}): Promise<ChatMessage> {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model,
        messages: messages.map(({ role, content }) => ({ role, content })),
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const data = response.data as {
      choices?: { message?: { content?: string };
                  error?: { code: number; message: string; metadata?: Record<string, unknown> } }[]
    };
    const choice = data.choices?.[0];
    if (choice?.error) {
      throw new Error(`OpenRouter error: ${choice.error.message}`);
    }
    const assistantMsg = choice?.message;
    return {
      role: 'assistant',
      content: assistantMsg?.content || '',
      model,
    };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'isAxiosError' in error && (error as any).isAxiosError) {
      const err = error as any;
      let msg = err.response?.data?.error || err.message || 'OpenRouter API error';
      if (typeof msg === 'object') {
        msg = JSON.stringify(msg);
      }
      throw new Error(`OpenRouter error: ${msg}`);
    }
    throw new Error('Unknown error calling OpenRouter');
  }
}
