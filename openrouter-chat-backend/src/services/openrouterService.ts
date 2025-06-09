import axios from 'axios';
import { z } from 'zod';
import { Readable } from 'stream';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  model?: string | null;
};

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
  annotations: z.union([
    z.record(z.any()),
    z.array(z.any())
  ]).optional(),
});

export const OpenRouterRequestMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: OpenRouterContentSchema,
  annotations: z.union([
    z.record(z.any()),
    z.array(z.any())
  ]).optional(),
});

export const OpenRouterAnnotationsSchema = z.union([
  z.record(z.any()),
  z.array(z.any()),
  z.null(),
]);

export type OpenRouterContent = z.infer<typeof OpenRouterContentSchema>;
export type OpenRouterAttachment = z.infer<typeof OpenRouterAttachmentSchema>;
export type OpenRouterResponseMessage = z.infer<typeof OpenRouterResponseMessageSchema>;
export type OpenRouterRequestMessage = z.infer<typeof OpenRouterRequestMessageSchema>;
export type OpenRouterAnnotations = z.infer<typeof OpenRouterAnnotationsSchema>;

// OpenRouter API endpoint
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Helper to convert DB annotation to OpenRouter annotation (validates with Zod)
export function dbAnnotationToOpenRouterAnnotation(annotation: unknown): any {
  const p = OpenRouterAnnotationsSchema.safeParse(annotation);
  return p.success && p.data !== null ? p.data : undefined;
}

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

// Helper function to build the common payload for OpenRouter API
function buildOpenRouterPayload({
  messages,
  model,
  useWebSearch = false,
  webSearchOptions,
  stream = false,
}: {
  messages: OpenRouterRequestMessage[];
  model: string;
  useWebSearch?: boolean;
  webSearchOptions?: { search_context_size?: 'low' | 'medium' | 'high' };
  stream?: boolean;
}): any {
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
    payload.plugins.push({ id: 'web' });
    if (webSearchOptions) {
      payload.web_search_options = webSearchOptions;
    }
  }

  if (stream) {
    payload.stream = true;
  }

  return payload;
}

// Helper function to build common headers for OpenRouter API
function buildOpenRouterHeaders(apiKey: string, isStreaming: boolean = false): Record<string, string> {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  if (isStreaming) {
    headers['Accept'] = 'text/event-stream';
  }

  return headers;
}

export async function getOpenRouterCompletion({
  messages,
  model,
  apiKey,
  useWebSearch = false,
  webSearchOptions,
  onDelta,
}: {
  messages: OpenRouterRequestMessage[];
  model: string;
  apiKey: string;
  useWebSearch?: boolean;
  webSearchOptions?: { search_context_size?: 'low' | 'medium' | 'high' };
  onDelta: (delta: string, done: boolean) => void;
}): Promise<void> {
  const payload = buildOpenRouterPayload({
    messages,
    model,
    useWebSearch,
    webSearchOptions,
    stream: true,
  });

  const headers = buildOpenRouterHeaders(apiKey, true);

  const response = await axios.post(OPENROUTER_API_URL, payload, {
    headers,
    responseType: 'stream',
  });
  return new Promise<void>((resolve, reject) => {
    let done = false;
    let buffer = '';
    const stream = response.data as Readable;
    stream.on('data', (chunk: Buffer) => {
      buffer += chunk.toString();

      let idx;
      while ((idx = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (line.startsWith('data:')) {
          const data = line.slice(5).trim();
          if (data === '[DONE]') {
            done = true;
            onDelta('', true);
            resolve();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content || '';
            if (delta) {
              onDelta(delta, false);
            }
          } catch (e) {
            // ignore parse errors
          }
        }
      }
    });
    stream.on('end', () => {
      if (!done) {
        onDelta('', true);
        resolve();
      }
    });
    stream.on('error', (err: any) => {
      reject(err);
    });
  });
}

export async function getOpenRouterCompletionNonStreaming({
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
}): Promise<string> {
  const payload = buildOpenRouterPayload({
    messages,
    model,
    useWebSearch,
    webSearchOptions,
    stream: false,
  });

  const headers = buildOpenRouterHeaders(apiKey, false);

  const response = await axios.post(OPENROUTER_API_URL, payload, {
    headers,
  });

  const parsedResponse = OpenRouterResponseSchema.safeParse(response.data);
  if (!parsedResponse.success) {
    throw new Error('Invalid response format from OpenRouter');
  }

  const choice = parsedResponse.data.choices?.[0];
  if (choice?.error) {
    throw new Error(`OpenRouter API error: ${choice.error.message}`);
  }

  if (!choice?.message?.content) {
    throw new Error('No content in OpenRouter response');
  }

  return choice.message.content;
}
