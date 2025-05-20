import React from 'react';

export default function LogoutButton() {
  function handleLogout() {
    localStorage.removeItem('user');
    window.location.reload(); // Ensures full state reset
  }
  return (
    <button
      onClick={handleLogout}
      className="text-sm text-blue-600 underline bg-white px-3 py-1 rounded shadow cursor-pointer"
    >
      Logout
    </button>
  );
}
