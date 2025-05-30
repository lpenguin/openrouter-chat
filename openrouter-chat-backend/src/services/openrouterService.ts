import axios from 'axios';
import { z } from 'zod';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  model?: string | null;
};

export const OpenRouterAnnotationSchema = z.union([
  z.record(z.any()),
  z.array(z.any())
]);

export const OpenRouterAttachmentSchema = z.union([
  z.object({ type: z.literal('text'), text: z.string() }),
  z.object({ type: z.literal('image_url'), image_url: z.object({ url: z.string() }) }),
  z.object({ type: z.literal('file'), file: z.object({ filename: z.string(), file_data: z.string() }) })
]);

export const OpenRouterContentSchema = z.union([
  z.string(),
  z.array(OpenRouterAttachmentSchema),
]);


export const OpenRouterResponseMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  annotations: OpenRouterAnnotationSchema.optional(),
});

export const OpenRouterRequestMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: OpenRouterContentSchema,
  annotations: OpenRouterAnnotationSchema.optional(),
});

export type OpenRouterContent = z.infer<typeof OpenRouterContentSchema>;
export type OpenRouterAnnotation = z.infer<typeof OpenRouterAnnotationSchema>;
export type OpenRouterAttachment = z.infer<typeof OpenRouterAttachmentSchema>;
export type OpenRouterResponseMessage = z.infer<typeof OpenRouterResponseMessageSchema>;
export type OpenRouterRequestMessage = z.infer<typeof OpenRouterRequestMessageSchema>;

export const OpenRouterResponseSchema = z.object({
  choices: z.array(z.object({
    message: OpenRouterResponseMessageSchema.optional(),
    error: z.object({
      code: z.number(),
      message: z.string(),
      metadata: z.record(z.any()).optional(),
    }).optional(),
  })).optional(),
});

export type OpenRouterResponse = z.infer<typeof OpenRouterResponseSchema>;

export async function getOpenRouterCompletionWithAttachments({
  messages,
  model,
  apiKey,
  useWebSearch = false,
  webSearchOptions,
}: {
  messages: OpenRouterRequestMessage[];
  model: string;
  apiKey: string;
  useWebSearch?: boolean;
  webSearchOptions?: { search_context_size?: 'low' | 'medium' | 'high' };
}): Promise<OpenRouterResponseMessage> {
  const payload: any = {
    model,
    messages,
    plugins: [
      {
        id: 'file-parser',
        pdf: { engine: 'mistral-ocr' },
      },
    ],
  };
  if (useWebSearch) {
    // Standard OpenRouter web search plugin
    payload.plugins.push({ id: 'web' });
    if (webSearchOptions) {
      payload.web_search_options = webSearchOptions;
    }
  }
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    // Validate response with Zod
    const parsed = OpenRouterResponseSchema.safeParse(response.data);
    if (!parsed.success) {
      throw new Error('Invalid OpenRouter response: ' + parsed.error.message);
    }
    const choice = parsed.data.choices?.[0];
    if (choice?.error) {
      throw new Error(`OpenRouter error: ${choice.error.message}`);
    }
    if (!choice?.message) throw new Error('No assistant message in response');
    return choice?.message;
  } catch (error: unknown) {
    // Detailed error logging
    if (error && typeof error === 'object' && 'isAxiosError' in error && (error as any).isAxiosError) {
      const err = error as any;
      let msg = err.response?.data?.error || err.message || 'OpenRouter API error';
      if (typeof msg === 'object') {
        msg = JSON.stringify(msg);
      }
      // Log the full OpenRouter error response for debugging
      console.error('OpenRouter API error:', err.response?.data || err);
      throw new Error(`OpenRouter error: ${msg}`);
    }
    // Log unknown errors
    console.error('Unknown error calling OpenRouter:', error);
    throw new Error('Unknown error calling OpenRouter');
  }
}
