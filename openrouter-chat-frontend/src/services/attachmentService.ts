import { MessageAttachment } from '../types/chat';
import { API_BASE_URL } from '../config/api';

export async function getAttachmentContent(attachmentId: number, token: string): Promise<Blob> {
  const res = await fetch(`${API_BASE_URL}/attachments/${attachmentId}/content`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!res.ok) {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Failed to get attachment content (${res.status})`);
    } else {
      throw new Error(`Failed to get attachment content (${res.status})`);
    }
  }
  
  return res.blob();
}

export async function getAttachmentUrl(attachmentId: number, token: string): Promise<string> {
  // Create a blob URL for the attachment content
  const blob = await getAttachmentContent(attachmentId, token);
  return URL.createObjectURL(blob);
}

export function openAttachment(attachmentId: number): void {
  // Open attachment in a new tab/window using the existing endpoint
  // Note: The browser will handle auth by including cookies if same-origin,
  // but for proper auth we'd need to pass the token as a query param or use a different approach
  const url = `${API_BASE_URL}/attachments/${attachmentId}/content`;
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
