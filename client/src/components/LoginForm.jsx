import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function LoginForm({ onLogin, isLoading, error, onSwitchToSignup }) {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const submit = (e) => {
    e.preventDefault();
    onLogin(form.email, form.password);
  };

  return (
    <div style={{minHeight:'100vh'}} className="flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white border rounded-xl p-6 shadow">
        <h2 className="text-2xl font-bold mb-1">Sign in</h2>
        <p className="text-sm text-gray-500 mb-6">Drug Inventory Supply Chain</p>

        {error ? <div className="mb-4 text-red-600 text-sm">{error}</div> : null}

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              className="w-full border rounded-md pl-10 pr-3 py-2"
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm(f => ({...f, email: e.target.value}))}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              className="w-full border rounded-md pl-10 pr-10 py-2"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm(f => ({...f, password: e.target.value}))}
              required
            />
            <button type="button" className="absolute right-3 top-3" onClick={() => setShowPassword(s => !s)}>
              {showPassword ? <EyeOff className="h-4 w-4 text-gray-500"/> : <Eye className="h-4 w-4 text-gray-500"/>}
            </button>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full py-2 rounded-md bg-blue-600 text-white disabled:opacity-60">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-4">
          <button onClick={onSwitchToSignup} className="text-blue-600">Don&apos;t have an account? Sign up</button>
        </div>
      </div>
    </div>
  );
}
