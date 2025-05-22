import React, { useRef } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

interface CopyButtonProps {
  value: string;
  className?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ value, className }) => {
  const [copied, setCopied] = React.useState(false);
  const [showPopover, setShowPopover] = React.useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setShowPopover(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
        setShowPopover(false);
      }, 1200);
    } catch (e) {
      setCopied(false);
      setShowPopover(false);
    }
  };

  const handleMouseEnter = () => setShowPopover(true);
  const handleMouseLeave = () => {
    if (!copied) setShowPopover(false);
  };

  return (
    <div className="relative inline-block overflow-visible" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        onClick={handleCopy}
        className={`ml-2 p-1 rounded transition bg-theme-surface hover:bg-theme-surface/80 focus:bg-theme-surface/80 active:bg-theme-surface/60 ${copied ? 'bg-theme-success/20' : ''} ${className || ''} cursor-pointer`}
        aria-label="Copy code to clipboard"
        type="button"
        style={{ color: 'var(--text-primary)' }}
      >
        {copied ? <CheckIcon className="w-4 h-4 text-theme-success" style={{ color: 'var(--success)' }} /> : <ClipboardIcon className="w-4 h-4" />}
      </button>
      {showPopover ? (
        <div
          className="absolute z-10 right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 rounded bg-theme-surface text-xs text-theme-primary shadow-lg border border-theme whitespace-nowrap"
          style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
        >
          {copied ? 'Copied!' : 'Copy to clipboard'}
        </div>
      ) : null}
    </div>
  );
};

export default CopyButton;
