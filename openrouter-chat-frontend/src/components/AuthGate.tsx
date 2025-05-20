import React, { useState, useEffect } from 'react';
import { loginApi, registerApi } from '../services/authService';
import App from '../App';

export default function AuthGate({ children }: { children?: React.ReactNode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Persist user session in localStorage
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = mode === 'login'
        ? await loginApi(email, password)
        : await registerApi(email, password);
      setUser({ ...data.user, token: data.token });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setUser(null);
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-80 flex flex-col gap-4">
          <h2 className="text-xl font-bold mb-2">{mode === 'login' ? 'Sign In' : 'Register'}</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (mode === 'login' ? 'Signing in...' : 'Registering...') : (mode === 'login' ? 'Sign In' : 'Register')}
          </button>
          <button
            type="button"
            className="text-blue-600 underline text-sm"
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
