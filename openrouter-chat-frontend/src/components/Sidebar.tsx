import { getUser } from '../services/userService';
import type { User } from '../schemas/userSchema';
import LogoutButton from './LogoutButton';

export default function Sidebar({ user }: { user: User }) {
  // Optionally, Sidebar could retrieve the user itself if needed:
  // const user = getUser();

  return (
    <aside className="flex flex-col justify-between h-screen w-56 bg-gray-100 border-r shadow-sm p-4">
      <div>
        <LogoutButton />
      </div>
      <div className="text-xs text-gray-500 text-center break-all">
        {user.email}
      </div>
    </aside>
  );
}
