import { AuthUser, authUserSchema } from '../schemas/authUserSchema';

// userService.ts
// Utility functions for storing and retrieving user data from localStorage

const USER_KEY = 'user';

export function getUser(): AuthUser | null {
  const stored = localStorage.getItem(USER_KEY);
  const parsed = stored ? authUserSchema.safeParse(JSON.parse(stored)) : null;
  if (parsed && parsed.success) {
    return parsed.data;
  } else {
    if (parsed) {
      console.error('Invalid user data:', parsed.error);
    }
    // Optionally, you can remove the invalid data from localStorage
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeUser() {
  localStorage.removeItem(USER_KEY);
}
