import type { AuthUser } from '../schemas/authUserSchema';
import { authUserSchema } from '../schemas/authUserSchema';
import { API_BASE_URL } from '../config/api';

export async function loginApi(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
  const data = await res.json();
  const parsed = authUserSchema.safeParse(data);
  if (!parsed.success) {
    console.error('Invalid user data:', parsed.error);
    throw new Error('Invalid user data');
  }
  return parsed.data;
}

export async function registerApi(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Registration failed');
  const data = await res.json();
  const parsed = authUserSchema.safeParse(data);
  if (!parsed.success) {
    console.error('Invalid user data:', parsed.error);
    throw new Error('Invalid user data');
  }
  return parsed.data;
}
