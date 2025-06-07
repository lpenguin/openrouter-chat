import type { AuthUser } from '../schemas/authUserSchema';
import { authUserSchema } from '../schemas/authUserSchema';
import { httpClient, HttpError } from './httpClient';

export async function loginApi(email: string, password: string): Promise<AuthUser> {
  try {
    const data = await httpClient.post<AuthUser>('/login', { email, password });
    const parsed = authUserSchema.safeParse(data);
    if (!parsed.success) {
      console.error('Invalid user data:', parsed.error);
      throw new Error('Invalid user data received from server');
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.status === 400) {
        throw new Error('Please check your email and password.');
      }
      if (error.status === 401) {
        throw new Error('Invalid email or password.');
      }
      if (error.status === 429) {
        throw new Error('Too many login attempts. Please try again later.');
      }
      throw new Error(error.userMessage);
    }
    throw error;
  }
}

export async function registerApi(email: string, password: string): Promise<AuthUser> {
  try {
    const data = await httpClient.post<AuthUser>('/register', { email, password });
    const parsed = authUserSchema.safeParse(data);
    if (!parsed.success) {
      console.error('Invalid user data:', parsed.error);
      throw new Error('Invalid user data received from server');
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.status === 400) {
        throw new Error(error.responseBody?.error || 'Please check your email and password format.');
      }
      if (error.status === 409) {
        throw new Error('An account with this email already exists.');
      }
      if (error.status === 429) {
        throw new Error('Too many registration attempts. Please try again later.');
      }
      throw new Error(error.userMessage);
    }
    throw error;
  }
}
