import ModelSelector from './ModelSelector';

interface UpperBarProps {
  currentModel: string | null;
  onModelChange: (model: string) => void;
  className?: string;
  chatName?: string | null;
}

export default function UpperBar({ 
  currentModel, 
  onModelChange,
  className = "",
  chatName = null
}: UpperBarProps) {
  return (
    <div className={className}>
      {/* Model selector on the left */}
      <div className="flex items-center">
        <ModelSelector
          currentModel={currentModel}
          onModelChange={onModelChange}
        />
      </div>
      
      {/* Chat name in the center (only if chat exists) */}
      {chatName && (
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
