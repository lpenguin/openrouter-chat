interface AuthRequiredProps {
  className?: string;
}

export default function AuthRequired({ className = '' }: AuthRequiredProps) {
  return (
    <div className={`flex items-center justify-center h-screen ${className}`}>
      <p className="text-gray-500">Please log in to access the chat.</p>
    </div>
  );
}
