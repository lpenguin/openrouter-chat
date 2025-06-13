import { XMarkIcon } from '@heroicons/react/24/outline';

interface SidebarCloseButtonProps {
  onClose: () => void;
}

export default function SidebarCloseButton({ onClose }: SidebarCloseButtonProps) {
  return (
    <div className="flex justify-end mb-4">
      <button
        onClick={onClose}
        className="p-2 hover:bg-theme-surface-200 rounded-md transition-colors"
        aria-label="Hide sidebar"
      >
        <XMarkIcon className="w-5 h-5 text-theme-secondary" />
      </button>
    </div>
  );
}
