import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FiPieChart, FiShoppingBag, FiFileText, FiUsers, FiSettings, FiLogOut, FiMenu, FiX, FiSun, FiMoon, FiDollarSign } from 'react-icons/fi';
import { supabase, isSupabaseConfigured } from '../../services/db';

export const AdminLayout: React.FC = () => {
  const { settings, theme, toggleTheme, showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Guard routes: Redirect to login if not authenticated
  useEffect(() => {
    const verifyAuth = async () => {
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          showToast('Please login to access the dashboard.', 'warning');
          sessionStorage.removeItem('hb_admin_token');
          navigate('/admin/login');
        } else {
          sessionStorage.setItem('hb_admin_token', 'authenticated_admin');
        }
      } else {
        const adminToken = sessionStorage.getItem('hb_admin_token');
        if (adminToken !== 'authenticated_admin') {
          showToast('Please login to access the dashboard.', 'warning');
          navigate('/admin/login');
        }
      }
    };

    verifyAuth();
  }, [navigate, showToast]);

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    sessionStorage.removeItem('hb_admin_token');
    showToast('Admin logged out successfully.', 'info');
    navigate('/admin/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <FiPieChart /> },
    { name: 'Food Management', path: '/admin/food', icon: <FiShoppingBag /> },
    { name: 'Orders List', path: '/admin/orders', icon: <FiFileText /> },
    { name: 'Payments Console', path: '/admin/payments', icon: <FiDollarSign /> },
    { name: 'Customer Metrics', path: '/admin/customers', icon: <FiUsers /> },
    { name: 'Global Settings', path: '/admin/settings', icon: <FiSettings /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex text-gray-800 dark:text-gray-200 transition-colors duration-300">
      
      {/* 1. SIDEBAR (DESKTOP) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700/80 shrink-0">
        {/* Brand header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700/80 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-base shadow">
              H
            </span>
            <span className="font-display font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider">
              {settings.restaurant_name}
            </span>
          </Link>
          <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">
            Admin
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                isActive(link.path)
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700/30'
              }`}
            >
              <span className="text-base">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer options */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700/80 space-y-1">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-gray-605 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all w-full text-left cursor-pointer"
          >
            <span className="text-base">
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
            </span>
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 transition-all w-full text-left cursor-pointer"
          >
            <span className="text-base"><FiLogOut /></span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MOBILE HEADER & NAVIGATION DRAWER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header Bar */}
        <header className="lg:hidden h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-750 flex items-center justify-between px-4 sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          
          <span className="font-display font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider">
            {settings.restaurant_name} Panel
          </span>

          <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            AD
          </span>
        </header>

        {/* Mobile Slide-out Drawer */}
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar drawer container */}
            <div className="relative flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full z-10 p-5 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-105 pb-4 dark:border-gray-700">
                <span className="font-display font-black text-sm text-gray-905 dark:text-white">
                  NAVIGATION
                </span>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                      isActive(link.path)
                        ? 'bg-primary text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700/30'
                    }`}
                  >
                    <span className="text-base">{link.icon}</span>
                    <span>{link.name}</span>
                  </Link>
                ))}
              </nav>

              <div className="border-t border-gray-105 pt-4 dark:border-gray-700 space-y-1">
                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    toggleTheme();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-55 dark:hover:bg-gray-700/30 w-full text-left cursor-pointer"
                >
                  {theme === 'dark' ? <FiSun /> : <FiMoon />}
                  <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15 w-full text-left cursor-pointer"
                >
                  <FiLogOut />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. MAIN CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Dynamic nested layout routing */}
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};
export default AdminLayout;
