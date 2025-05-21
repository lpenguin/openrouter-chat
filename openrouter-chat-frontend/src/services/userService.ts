import type { User } from '../schemas/userSchema';
import type { AuthUser } from '../schemas/authUserSchema';

// userService.ts
// Utility functions for storing and retrieving user data from localStorage

const USER_KEY = 'user';

export function getUser(): AuthUser | null {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) as AuthUser : null;
}

export function setUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeUser() {
  localStorage.removeItem(USER_KEY);
}
