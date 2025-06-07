import { MessageAttachment } from '../types/chat';
import { httpClient, HttpError } from './httpClient';

export async function getAttachmentContent(attachmentId: number, token: string): Promise<Blob> {
  httpClient.setAuthToken(token);
  try {
    // Use the raw fetch method for blob responses
    const blob = await httpClient.getBlob(`/attachments/${attachmentId}/content`);
    return blob;
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.status === 401) {
        throw new Error('Your session has expired. Please sign in again.');
      }
      if (error.status === 404) {
        throw new Error('Attachment not found or you do not have permission to access it.');
      }
      if (error.status === 403) {
        throw new Error('You do not have permission to access this attachment.');
      }
      throw new Error(error.userMessage);
    }
    throw error;
  } finally {
    httpClient.clearAuthToken();
  }
}

export async function getAttachmentUrl(attachmentId: number, token: string): Promise<string> {
  // Create a blob URL for the attachment content
  const blob = await getAttachmentContent(attachmentId, token);
  return URL.createObjectURL(blob);
}

export function openAttachment(attachmentId: number): void {
  // Open attachment in a new tab/window using the existing endpoint
  // Note: For proper auth we should use the authenticated version
  console.warn('Using unauthenticated attachment opening - consider using openAttachmentAuthenticated instead');
  const url = `/api/attachments/${attachmentId}/content`;
  window.open(url, '_blank');
}

export async function openAttachmentAuthenticated(attachmentId: number, token: string): Promise<void> {
  // For authenticated opening, we need to fetch and create a blob URL
  try {
    const blob = await getAttachmentContent(attachmentId, token);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Clean up the blob URL after a delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error('Failed to open attachment:', error);
    // Fallback to simple URL opening
    openAttachment(attachmentId);
  }
}

export function downloadAttachment(attachment: MessageAttachment, token: string): void {
  // Only download server attachments (those with IDs)
  if (!attachment.id) {
    console.warn('Cannot download local echo attachment - not yet saved to server');
    return;
  }
  
  // Create a download link and trigger download
  getAttachmentContent(attachment.id, token)
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    })
    .catch(error => {
      console.error('Failed to download attachment:', error);
    });
}

export function isImageType(mimetype: string): boolean {
  return mimetype.startsWith('image/');
}

export function isPdfType(mimetype: string): boolean {
  return mimetype === 'application/pdf';
}

export function getFileIcon(mimetype: string): 'image' | 'pdf' | 'document' {
  if (isImageType(mimetype)) return 'image';
  if (isPdfType(mimetype)) return 'pdf';
  return 'document';
}
