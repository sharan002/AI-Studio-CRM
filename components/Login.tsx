
import React, { useState } from 'react';
import { User } from '../types';
import { Icons } from './Icons';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
  isLoading: boolean;
}

const Login: React.FC<LoginProps> = ({ users, onLogin, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // In a real app, this would be an API call
    // For this demo, we check against the fetched users list
    const foundUser = users.find(u => u.useremail === email);
    
    // We don't have encrypted passwords in the front-end list usually, 
    // but the provided mock data has a 'password' field.
    // Let's simulate a check.
    if (foundUser && (foundUser as any).password === password) {
      onLogin(foundUser);
    } else {
      setError('Invalid email or password. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="p-8 bg-blue-600 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
            <Icons.Settings className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold">EduLead CRM</h1>
          <p className="text-blue-100 text-sm mt-1 opacity-80">Institutional Access Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Icons.User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
                placeholder="Ex: sharan@demo.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /> {/* Mocking lock icon with search if not available */}
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? 'Loading Staff Data...' : 'Sign In to Dashboard'}
          </button>

          <div className="pt-4 text-center">
            <p className="text-slate-400 text-xs">
              Contact administrator for account recovery or access requests.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
