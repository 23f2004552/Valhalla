"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                document.cookie = `rms_token=${data.access_token}; path=/; max-age=3600; SameSite=Strict`;
                window.location.href = '/admin/dashboard';
            } else {
                const errData = await response.json().catch(() => ({}));
                setError(errData.detail || 'Authentication failed');
            }
        } catch (err) {
            setError('Connection error — is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-text-primary flex flex-col items-center justify-center px-6">
          
          {/* Centered login card */}
          <div className="w-full max-w-md">
            
            {/* Brand */}
            <div className="mb-12 text-center">
              <Link href="/">
                <h1 className="font-luxury text-[#FFF9EB] text-5xl md:text-6xl mb-3">valhalla</h1>
              </Link>
              <p className="font-sans text-[#FFF9EB]/30 text-[11px] tracking-[0.4em] uppercase">
                Studio Access
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-3 border border-red-400/20 bg-red-400/5 text-red-300 text-xs font-sans tracking-wide text-center rounded-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block font-sans text-[#FFF9EB]/40 text-[10px] tracking-[0.3em] uppercase mb-2">
                  Username
                </label>
                <input 
                  type="text" 
                  className="w-full bg-transparent border-b border-[#FFF9EB]/15 text-[#FFF9EB] font-sans text-sm py-3 px-1 focus:border-[#F8E47D]/50 outline-none transition-colors duration-500 placeholder:text-[#FFF9EB]/15" 
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block font-sans text-[#FFF9EB]/40 text-[10px] tracking-[0.3em] uppercase mb-2">
                  Password
                </label>
                <input 
                  type="password" 
                  className="w-full bg-transparent border-b border-[#FFF9EB]/15 text-[#FFF9EB] font-sans text-sm py-3 px-1 focus:border-[#F8E47D]/50 outline-none transition-colors duration-500 placeholder:text-[#FFF9EB]/15"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-[#FFF9EB] text-text-primary font-sans text-[13px] tracking-wider py-3.5 mt-4 hover:bg-[#F8E47D] transition-colors duration-500 disabled:opacity-40 rounded-sm"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Enter Studio'}
              </button>
            </form>

            {/* Back link */}
            <div className="mt-8 text-center">
              <Link 
                href="/" 
                className="font-sans text-[#FFF9EB]/20 text-[11px] tracking-wider hover:text-[#FFF9EB]/50 transition-colors duration-300"
              >
                ← Back to Valhalla
              </Link>
            </div>
          </div>
        </main>
    );
}
