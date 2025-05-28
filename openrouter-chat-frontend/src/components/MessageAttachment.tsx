import React, { useState, useEffect } from 'react';
import { DocumentIcon, PhotoIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { isImageType, isPdfType } from '../services/attachmentService';
import { useAuthStore } from '../store/authStore';
import { MessageAttachment as MessageAttachmentType } from '../types/chat';

interface MessageAttachmentProps {
  attachment: MessageAttachmentType;
  showPreview?: boolean;
}

const MessageAttachment: React.FC<MessageAttachmentProps> = ({ 
  attachment, 
  showPreview = true 
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const authUser = useAuthStore((state) => state.authUser);
  const isImage = isImageType(attachment.mimetype);
  const isPdf = isPdfType(attachment.mimetype);

  // Always load preview: from server if id, else from base64 data
  useEffect(() => {
    let url: string | null = null;
    setLoading(true);
    setImageError(false);
    if (isImage && showPreview) {
      if (attachment.id && authUser) {
        // Fetch from server
        (async () => {
          try {
            const response = await fetch(`/api/attachments/${attachment.id}/content`, {
              headers: {
                'Authorization': `Bearer ${authUser.token}`,
              },
            });
            if (!response.ok) throw new Error('Failed to load image');
            const blob = await response.blob();
            url = URL.createObjectURL(blob);
            setPreviewUrl(url);
          } catch (e) {
            setImageError(true);
            setPreviewUrl(null);
          } finally {
            setLoading(false);
          }
        })();
      } else if (attachment.data) {
        // Use base64 data
        try {
          url = `data:${attachment.mimetype};base64,${attachment.data}`;
          setPreviewUrl(url);
        } catch (e) {
          setImageError(true);
          setPreviewUrl(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setPreviewUrl(null);
      }
    } else {
      setLoading(false);
      setPreviewUrl(null);
    }
    return () => {
      if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
    };
  }, [attachment.id, attachment.data, isImage, showPreview, attachment.mimetype, authUser]);

  // Always open the previewUrl in a new window on click
  const handleClick = () => {
    if (!previewUrl) return;
    if (previewUrl.startsWith('data:')) {
      // Convert base64 data URL to Blob and open as object URL
      const arr = previewUrl.split(',');
      const match = arr[0].match(/:(.*?);/);
      const mime = match && match[1] ? match[1] : (attachment.mimetype || 'application/octet-stream');
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      // Optionally revoke after a delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } else {
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setPreviewUrl(null);
  };

  // Render image preview if available
  if (isImage && showPreview && !imageError && !loading && previewUrl) {
    return (
      <div className="relative group">
        <div
          className="relative rounded-lg overflow-hidden border border-theme bg-theme-surface transition-all duration-200 w-full max-w-full cursor-pointer hover:shadow-md"
          onClick={handleClick}
          role="button"
          tabIndex={0}
        >
          <img
            src={previewUrl}
            alt={attachment.filename}
            className="w-full h-32 object-cover"
            onError={handleImageError}
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <ArrowTopRightOnSquareIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
          <div className="p-2 bg-theme-surface border-t border-theme">
            <p className="text-xs text-theme-secondary truncate" title={attachment.filename}>
              {attachment.filename}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state for images
  if (isImage && showPreview && loading && !imageError) {
    return (
      <div className="relative group">
        <div className="relative rounded-lg overflow-hidden border border-theme bg-theme-surface w-full max-w-full cursor-pointer">
          <div className="w-full h-32 bg-theme-background flex items-center justify-center">
            <div className="animate-pulse">
              <PhotoIcon className="w-8 h-8 text-theme-secondary" />
            </div>
          </div>
          <div className="p-2 bg-theme-surface border-t border-theme">
            <p className="text-xs text-theme-secondary truncate" title={attachment.filename}>
              {attachment.filename}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback to icon-based display
  return (
    <div
      className="inline-flex items-center bg-theme-surface border border-theme rounded-lg px-3 py-2 transition-colors w-full max-w-full group cursor-pointer hover:bg-theme-accent/10"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {isImage ? (
        <PhotoIcon className="w-5 h-5 text-theme-secondary mr-2 flex-shrink-0" />
      ) : isPdf ? (
        <DocumentIcon className="w-5 h-5 text-theme-secondary mr-2 flex-shrink-0" />
      ) : (
        <DocumentIcon className="w-5 h-5 text-theme-secondary mr-2 flex-shrink-0" />
      )}
      <span className="text-sm text-theme-primary truncate flex-1" title={attachment.filename}>
        {attachment.filename}
      </span>
      <ArrowTopRightOnSquareIcon className="w-4 h-4 text-theme-secondary ml-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </div>
  );
};

export default MessageAttachment;
