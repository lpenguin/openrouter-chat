import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { loginApi, registerApi } from '../services/authService';

export default function AuthGate({ children }: { children?: React.ReactNode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { authUser, setAuthUser } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = mode === 'login'
        ? await loginApi(email, password)
        : await registerApi(email, password);
      setAuthUser(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!authUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-theme-background text-theme-primary">
        <form onSubmit={handleSubmit} className="bg-theme-surface p-6 rounded shadow w-80 flex flex-col gap-4 border border-theme">
          <h2 className="text-xl font-bold mb-2 text-theme-primary">{mode === 'login' ? 'Sign In' : 'Register'}</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border border-theme p-2 rounded bg-theme-background text-theme-primary placeholder:text-theme-secondary"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border border-theme p-2 rounded bg-theme-background text-theme-primary placeholder:text-theme-secondary"
            required
          />
          <button
            type="submit"
            className="bg-theme-primary text-white py-2 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (mode === 'login' ? 'Signing in...' : 'Registering...') : (mode === 'login' ? 'Sign In' : 'Register')}
          </button>
          <button
            type="button"
            className="text-theme-primary underline text-sm"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign In'}
          </button>
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
