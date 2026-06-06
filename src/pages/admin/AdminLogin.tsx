import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FiMail, FiLock, FiLock as FiShield, FiArrowLeft } from 'react-icons/fi';
import { supabase, isSupabaseConfigured } from '../../services/db';

export const AdminLogin: React.FC = () => {
  const { showToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (sessionStorage.getItem('hb_admin_token') === 'authenticated_admin') {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        // Authenticate via Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: password
        });

        if (error) {
          setError(error.message);
          showToast(error.message, 'error');
        } else if (data?.session) {
          sessionStorage.setItem('hb_admin_token', 'authenticated_admin');
          showToast('Admin logged in successfully!', 'success');
          navigate('/admin/dashboard');
        } else {
          setError('Authentication failed. No active session.');
          showToast('Authentication failed', 'error');
        }
      } else {
        // Fallback to static credentials for Demo/Local Storage mode
        if (email.trim().toLowerCase() === 'admin@hungerbites.com' && password === 'admin123') {
          sessionStorage.setItem('hb_admin_token', 'authenticated_admin');
          showToast('Admin logged in successfully (Demo Mode)!', 'success');
          navigate('/admin/dashboard');
        } else {
          setError('Invalid email address or password.');
          showToast('Authentication failed', 'error');
        }
      }
    } catch {
      setError('An error occurred during authentication.');
      showToast('An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center px-4 py-12 relative">
      
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-primary transition-colors cursor-pointer"
      >
        <FiArrowLeft /> Back to Website
      </button>

      <div className="w-full max-w-md space-y-8">
        
        {/* Lock Shield Icon and title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl mx-auto shadow-lg shadow-primary/25">
            <FiShield />
          </div>
          <h1 className="font-display font-extrabold text-3xl text-gray-900 dark:text-white mt-4">
            Admin Console
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-400">
            Secure login portal for Hunger Bites restaurant management.
          </p>
        </div>

        {/* Login form card */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-xl space-y-6">
          
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100/30 text-red-650 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <FiMail /> Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hungerbites.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700/70 bg-gray-50 dark:bg-gray-900 text-sm text-gray-805 dark:text-white focus:outline-none focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <FiLock /> Password
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700/70 bg-gray-50 dark:bg-gray-900 text-sm text-gray-805 dark:text-white focus:outline-none focus:border-primary transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Authenticating...' : 'Sign In to Panel'}
            </button>
          </form>


        </div>

      </div>
    </div>
  );
};
export default AdminLogin;
