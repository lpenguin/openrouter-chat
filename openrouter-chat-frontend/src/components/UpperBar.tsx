import ModelSelector from './ModelSelector';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface UpperBarProps {
  currentModel: string | null;
  onModelChange: (model: string) => void;
  className?: string;
  chatName?: string | null;
  sidebarVisible: boolean;
  onToggleSidebar: () => void;
  isMobile: boolean;
}

export default function UpperBar({ 
  currentModel, 
  onModelChange,
  className = "",
  chatName = null,
  sidebarVisible,
  onToggleSidebar,
  isMobile
}: UpperBarProps) {
  return (
    <div className={className}>
      {/* Sidebar toggle button and model selector */}
      <div className="flex items-center">
        {!sidebarVisible && (
          <button
            onClick={onToggleSidebar}
            className="p-2 mr-2 hover:bg-theme-surface-200 rounded-md transition-colors"
            aria-label="Show sidebar"
          >
            <Bars3Icon className="w-6 h-6 text-theme-secondary" />
          </button>
        )}
        <ModelSelector
          currentModel={currentModel}
          onModelChange={onModelChange}
        />
      </div>
      
      {/* Chat name in the center (only if chat exists) */}
      {chatName && !isMobile && (
        <div className="flex-1 flex justify-center">
          <h1 className="text-lg font-semibold text-theme-primary truncate max-w-md">
            {chatName}
          </h1>
        </div>
      )}
      
      {/* Right side placeholder (can be used for future features) */}
      <div className="flex items-center">
        {/* Empty for now, but maintains the justify-between layout */}
      </div>
    </div>
  );
}
