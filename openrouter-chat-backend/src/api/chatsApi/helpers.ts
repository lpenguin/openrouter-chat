// Helper functions for chats API (excluding OpenRouter-specific schemas)
import { ApiError } from '../../middleware/errorHandler';
import { Attachment, MessageDto } from './schemas';
import { DbSelectAttachment, DbSelectMessage, DbInsertAttachment } from '../../db/schema';
import { getAttachmentsForMessage } from '../../services/chatService';
import { dbAnnotationToOpenRouterAnnotation } from '../../services/openrouterService';
import { OpenRouterAttachment, OpenRouterRequestMessage } from '../../services/openrouterService';
import { uuid } from 'drizzle-orm/gel-core';

// Global in-memory store for streaming assistant messages and listeners
// Keyed by chatId
interface StreamingMessageState {
  message: MessageDto;
  listeners: Array<(content: string, done: boolean) => void>;
}
const streamingState: Record<string, StreamingMessageState> = {};

// Helper to map a single attachment to OpenRouterContent
export function mapAttachmentToOpenRouterContent(att: Attachment): OpenRouterAttachment | undefined {
  if (att.mimetype === 'application/pdf') {
    return {
      type: 'file',
      file: {
        filename: att.filename,
        file_data: `data:application/pdf;base64,${att.data}`,
      },
    };
  } else if (att.mimetype.startsWith('image/')) {
    return {
      type: 'image_url',
      image_url: {
        url: `data:${att.mimetype};base64,${att.data}`,
      },
    };
  } else {
    return undefined;
  }
}

// Helper to build OpenRouter user message with attachments/annotations
export function buildUserOpenRouterMessage(content: string, attachments?: Attachment[]): OpenRouterRequestMessage[] {
  if (!attachments || attachments.length === 0) {
    return [{ role: 'user', content }];
  }

  // 1. Create list of text attachment messages (as text blocks)
  const textAttachmentMessages: OpenRouterRequestMessage[] = attachments
    .filter(att => att.mimetype.startsWith('text/') || att.mimetype === 'text/markdown' || att.mimetype === 'text/plain')
    .map(att => {
      const decoded = Buffer.from(att.data, 'base64').toString('utf-8');
      return {
        role: 'user',
        content: `--- Attachment: ${att.filename} (${att.mimetype}) ---\n${decoded}\n--- End of attachment: ${att.filename} ---`
      };
    });

  // 2. Create a list of OpenRouter attachment content elements (non-text)
  const openrouterAttachmentContents: OpenRouterAttachment[] = attachments
    .filter(att => !(att.mimetype.startsWith('text/') || att.mimetype === 'text/markdown' || att.mimetype === 'text/plain'))
    .map(att => mapAttachmentToOpenRouterContent(att))
    .filter((x): x is OpenRouterAttachment => x !== undefined);

  // 3. Final message: all non-text attachments and the user content
  // Compose the text part as a {type: 'text', text: ...}
  const textContent: { type: 'text'; text: string } = { type: 'text', text: content };
  const finalMessageContent: (OpenRouterAttachment | { type: 'text'; text: string })[] = [
    textContent,
    ...openrouterAttachmentContents
  ];

  // 4. Return: all text attachment messages, then the final message
  return [
    ...textAttachmentMessages,
    { role: 'user', content: finalMessageContent }
  ];
}

// Helper to validate attachments (decode base64, check PDF header, throw on error)
export function validateAttachments(attachments: Attachment[]): void {
  attachments.forEach((a) => {
    if (a.mimetype === 'application/pdf') {
      const buffer = Buffer.from(a.data, 'base64');
      if (buffer.subarray(0, 5).toString() !== '%PDF-') {
        throw new ApiError(`File does not start with %PDF-: ${a.filename}`, 400);
      }
    }
  });
}

function mapDbAttacmentToOpenRouterContent(dbAttachment: DbSelectAttachment): OpenRouterAttachment | undefined {
  if (dbAttachment.mimetype === 'application/pdf') {
    return {
      type: 'file',
      file: {
        filename: dbAttachment.filename,
        file_data: `data:application/pdf;base64,${dbAttachment.data.toString('base64')}`,
      },
    };
  } else if (dbAttachment.mimetype.startsWith('image/')) {
    return {
      type: 'image_url',
      image_url: {
        url: `data:${dbAttachment.mimetype};base64,${dbAttachment.data.toString('base64')}`,
      },
    };
  }
  return undefined;
}

// Helper to map attachments to OpenRouterContent (base64 encoding)
export function mapAttachmentsToOpenRouterContent(attachments: Attachment[]): OpenRouterAttachment[] {
  return attachments
    .map(mapAttachmentToOpenRouterContent)
    .filter((x): x is OpenRouterAttachment => x !== undefined);
}

// Helper to convert DB message to OpenRouter message
export async function dbMessageToOpenRouterMessage(dbMessage: DbSelectMessage): Promise<OpenRouterRequestMessage> {
  const attachments = await getAttachmentsForMessage(dbMessage.id);
  const content = attachments.length > 0
    ? [
        { type: 'text' as 'text', text: dbMessage.content },
        ...attachments
          .map(mapDbAttacmentToOpenRouterContent)
          .filter((x): x is OpenRouterAttachment => x !== undefined)
      ]
    : dbMessage.content ;
  const base: OpenRouterRequestMessage = { role: dbMessage.role, content };
  const annotations = dbAnnotationToOpenRouterAnnotation(dbMessage.annotations);
  return annotations ? { ...base, annotations } : base;
}

export function dbMessageToMessageDto(dbMessage: DbSelectMessage, dbAttachments?: DbSelectAttachment[] | undefined): MessageDto {
  const messageDto: MessageDto = {
    id: dbMessage.id,
    role: dbMessage.role,
    content: dbMessage.content,
    createdAt: dbMessage.created_at,
    updatedAt: dbMessage.updated_at,
    model: dbMessage.model ?? undefined,
    provider: dbMessage.provider ?? undefined,
  };
  if (dbAttachments && dbAttachments.length > 0) {
    messageDto.attachments = dbAttachments.map(att => ({
      id: att.id,
      filename: att.filename,
      mimetype: att.mimetype,
    }));
  }
  // Extract web search annotations if present
  if (dbMessage.annotations && Array.isArray(dbMessage.annotations)) {
    const searchAnnotations = dbMessage.annotations
      .filter((a: any) => a && a.type === 'url_citation' && a.url_citation)
      .map((a: any) => ({
        url: a.url_citation.url,
        faviconUrl: a.url_citation.favicon_url,
        citation: a.url_citation.citation,
        title: a.url_citation.title,
        content: a.url_citation.content,
        startIndex: a.url_citation.start_index,
        endIndex: a.url_citation.end_index,
      }));
    if (searchAnnotations.length > 0) {
      messageDto.searchAnnotations = searchAnnotations;
    }
  }
  // Add status field
  if (dbMessage.role === 'assistant') {
    // Placeholder: always complete for now, will update in handler
    messageDto.status = 'complete';
  } else {
    messageDto.status = null;
  }
  return messageDto;
}

// Move the attachmentsToInsert mapping logic to a new helper function in helpers.ts for reuse and clarity.
export function attachmentsToInsertArray(attachments: Attachment[] | undefined, uuid: string, userId: number, messageId: string): DbInsertAttachment[] {
  return attachments?.map(att => ({
    chat_id: uuid,
    user_id: userId,
    message_id: messageId,
    filename: att.filename,
    mimetype: att.mimetype,
    data: Buffer.from(att.data, 'base64'),
  })) || [];
}

// Streaming messages handlers

export function addStreamingMessage(chatId: string, message: MessageDto) {
  if (!streamingState[chatId]) {
    streamingState[chatId] = { message, listeners: [] };
  } else {
    streamingState[chatId].message = message;
  }
}

export function getStreamingMessage(chatId: string) {
  return streamingState[chatId]?.message;
}

export function removeStreamingMessage(chatId: string) {
  delete streamingState[chatId];
}

export function addStreamingMessageListener(chatId: string, listener: (content: string, done: boolean) => void) {
  if (!streamingState[chatId]) {
    streamingState[chatId] = { message: { id: chatId, role: 'assistant', content: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: 'generating' }, listeners: [listener] };
  } else {
    streamingState[chatId].listeners.push(listener);
  }
}

export function removeStreamingMessageListeners(chatId: string) {
  if (streamingState[chatId]) {
    streamingState[chatId].listeners = [];
  }
}

export function triggerStreamingMessageListeners(chatId: string, content: string, done = false) {
  if (streamingState[chatId]) {
    for (const listener of streamingState[chatId].listeners) {
      listener(content, done);
    }
    if (done) {
      removeStreamingMessage(chatId); // Clear state when done
    }
  }
}
