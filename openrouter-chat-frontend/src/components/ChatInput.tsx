import React, { useState, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { PaperClipIcon, XMarkIcon, DocumentIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { lookup } from 'mrmime';

interface Attachment {
  file: File;
  previewUrl: string; // For images
  type: 'image' | 'pdf' | 'text';
  mimetype?: string;
}

interface ChatInputProps {
  onSend: (content: string, attachments?: { filename: string; mimetype: string; data: string }[], useSearch?: boolean) => void;
  sendDisabled?: boolean;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'text/plain',
  'text/markdown',
  'text/x-markdown',
  'text/csv',
  'text/html',
  'text/css',
  'text/javascript',
  'application/json',
  'application/xml',
];

const ChatInput: React.FC<ChatInputProps> = ({ onSend, sendDisabled }) => {
  const [value, setValue] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [sendDisabled, value]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      attachments.forEach(att => {
        if (att.type === 'image') URL.revokeObjectURL(att.previewUrl);
      });
    };
  }, [attachments]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          // Remove the data:...;base64, prefix if present
          const base64 = result.split(',')[1] || result;
          resolve(base64);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSend = async () => {
    if (!value.trim() && attachments.length === 0) return;
    // Prepare attachments as base64
    const processed = await Promise.all(
      attachments.map(async att => {
        const data = await fileToBase64(att.file);
        return {
          filename: att.file.name,
          mimetype: att.mimetype || 'application/octet-stream',
          data,
        };
      })
    );
    onSend(value, processed.length > 0 ? processed : undefined, useSearch);
    setValue('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendDisabled && (value.trim() || attachments.length > 0)) {
        handleSend();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const addFiles = (files: File[]) => {
    const isAcceptedFile = (file: File) => {
      // Detect proper MIME type using mrmime if browser doesn't provide it or provides generic type
      let detectedMimeType = file.type;
      if (!file.type || file.type === 'application/octet-stream' || file.type === '') {
        detectedMimeType = lookup(file.name) || 'application/octet-stream';
      }
      
      // Check if the detected MIME type is accepted
      return ACCEPTED_TYPES.includes(detectedMimeType);
    };
    
    const validFiles = files.filter(isAcceptedFile);
    const newAttachments: Attachment[] = validFiles.map(f => {
      let type: Attachment['type'] = 'image';
      
      // Detect proper MIME type using mrmime if browser doesn't provide it or provides generic type
      let detectedMimeType = f.type;
      if (!f.type || f.type === 'application/octet-stream' || f.type === '') {
        detectedMimeType = lookup(f.name) || 'application/octet-stream';
      }
      
      if (detectedMimeType === 'application/pdf') {
        type = 'pdf';
      } else if (detectedMimeType.startsWith('text/') || 
                 detectedMimeType === 'text/markdown' || 
                 detectedMimeType === 'text/x-markdown' ||
                 detectedMimeType === 'application/json' ||
                 detectedMimeType === 'application/xml') {
        type = 'text';
      }
      
      return {
        file: f,
        previewUrl: detectedMimeType.startsWith('image/') ? URL.createObjectURL(f) : '',
        type,
        mimetype: detectedMimeType,
      };
    });
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeAttachment = (idx: number) => {
    setAttachments(prev => {
      const copy = [...prev];
      if (copy[idx].type === 'image') URL.revokeObjectURL(copy[idx].previewUrl);
      copy.splice(idx, 1);
      return copy;
    });
  };

  // Add support for pasting images
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!e.clipboardData || !e.clipboardData.items) return;
    const items = Array.from(e.clipboardData.items);
    const imageFiles: File[] = [];
    for (const item of items) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file && ACCEPTED_TYPES.includes(file.type)) {
          imageFiles.push(file);
        }
      }
    }
    if (imageFiles.length > 0) {
      addFiles(imageFiles);
      e.preventDefault(); // Prevent default paste behavior for images
    }
  };

  return (
    <div className="py-4">
      <div
        className={`m-auto w-full max-w-2xl flex flex-col gap-2 bg-theme-surface border border-theme rounded-lg px-3 py-2 shadow-lg transition-colors ${dragActive ? 'ring-2 ring-theme-primary' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {attachments.map((att, idx) => (
              <div key={idx} className="relative flex items-center border rounded bg-theme px-2 py-1">
                {att.type === 'image' ? (
                  <img src={att.previewUrl} alt={att.file.name} className="w-10 h-10 object-cover rounded mr-2" />
                ) : (
                  <DocumentIcon className="w-8 h-8 text-theme-secondary mr-2" />
                )}
                <span className="truncate max-w-[80px] text-xs">{att.file.name}</span>
                <button
                  type="button"
                  className="ml-1 p-1 hover:bg-theme-danger/10 rounded"
                  onClick={() => removeAttachment(idx)}
                  aria-label="Remove attachment"
                >
                  <XMarkIcon className="w-4 h-4 text-theme-secondary" />
                </button>
              </div>
            ))}
          </div>
        )}
        {/* First row: Text input */}
        <div className="w-full">
          <TextareaAutosize
            className="w-full bg-transparent outline-none text-theme-primary placeholder:text-theme-secondary text-base resize-none py-2"
            placeholder="Type your message..."
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            minRows={1}
            maxRows={8}
            ref={textareaRef}
          />
        </div>
        
        {/* Second row: Buttons */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-2 hover:bg-theme-accent/10 rounded"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach file"
            >
              <PaperClipIcon className="w-6 h-6 text-theme-secondary" />
            </button>
            <button
              type="button"
              className={`p-2 rounded ${useSearch ? 'bg-theme-primary text-white' : 'hover:bg-theme-accent/10'} transition-colors`}
              onClick={() => setUseSearch(v => !v)}
              aria-label={useSearch ? 'Disable web search' : 'Enable web search'}
              title={useSearch ? 'Web search enabled' : 'Enable web search'}
            >
              <GlobeAltIcon className="w-6 h-6" />
            </button>
            <input
              type="file"
              accept={[...ACCEPTED_TYPES, '.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.txt', '.md', '.markdown', '.csv', '.htm', '.html', '.css', '.js', '.json', '.xml'].join(',')}
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              tabIndex={-1}
            />
          </div>
          
          <button
            className="bg-theme-primary hover:bg-theme-success text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-150 disabled:opacity-50 shadow cursor-pointer"
            onClick={handleSend}
            disabled={sendDisabled || (!value.trim() && attachments.length === 0)}
          >
            Send
          </button>
        </div>
        {dragActive && (
          <div className="absolute inset-0 bg-theme-surface/80 flex items-center justify-center pointer-events-none rounded-lg">
            <span className="text-theme-primary font-semibold">Drop files to attach</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
