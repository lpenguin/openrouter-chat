import React from 'react';
import LogoutButton from './LogoutButton';

export default function Sidebar({ email }: { email: string }) {
  return (
    <aside className="flex flex-col justify-between h-screen w-56 bg-gray-100 border-r shadow-sm p-4">
      <div>
        <LogoutButton />
      </div>
      <div className="text-xs text-gray-500 text-center break-all">
        {email}
      </div>
    </aside>
  );
}
