import { Menu } from '@headlessui/react';
import ChevronDownIcon from '@heroicons/react/20/solid/ChevronDownIcon.js';
import type { User } from '../schemas/userSchema';

export default function Sidebar({ user }: { user: User }) {
  function handleLogout() {
    localStorage.removeItem('user');
    window.location.reload();
  }

  return (
    <aside className="flex flex-col justify-between h-screen w-56 bg-gray-100 border-r shadow-sm p-4">
      <div />
      <div className="mb-2 flex justify-end">
        <Menu as="div" className="relative inline-block text-right w-auto">
          <Menu.Button className="flex flex-row-reverse items-center gap-2 px-3 py-2 rounded bg-white shadow hover:bg-gray-50 text-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
            <span className="truncate max-w-[120px]">{user.email}</span>
            <ChevronDownIcon className="w-4 h-4 text-gray-400 ml-1" />
          </Menu.Button>
          <Menu.Items className="absolute right-0 bottom-full mb-2 w-40 origin-bottom-right bg-white border border-gray-200 rounded shadow-lg focus:outline-none z-10">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={`w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 ${active ? 'bg-gray-100' : ''}`}
                  >
                    Logout
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Menu>
      </div>
    </aside>
  );
}
