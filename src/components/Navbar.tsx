import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FiShoppingBag, FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';
import { CartDrawer } from './CartDrawer';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme, cartSummary, settings } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-white/10 dark:border-gray-800/50 shadow-3d-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-primary/20">
                H
              </span>
              <div>
                <span className="font-display font-black text-xl tracking-tight text-gray-900 dark:text-white">
                  {settings.restaurant_name}
                </span>
                <span className="block text-[10px] text-primary font-bold tracking-wider uppercase -mt-1">
                  Food Express
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`font-semibold text-sm transition-colors ${
                    isActive(link.path)
                      ? 'text-primary'
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="p-2.5 rounded-xl text-gray-500 hover:text-primary dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-3d-sm border border-transparent hover:border-gray-100 dark:hover:border-gray-700 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </button>



              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative px-5 py-3 bg-primary text-white rounded-xl transition-all shadow-3d-glow hover:scale-105 active:scale-95 btn-tactile cursor-pointer flex items-center gap-1.5"
              >
                <FiShoppingBag className="w-4 h-4" />
                <span className="text-xs font-bold">Cart</span>
                {cartSummary.totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-primary animate-pulse">
                    {cartSummary.totalItems}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
              >
                {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-all cursor-pointer"
              >
                <FiShoppingBag className="w-6 h-6" />
                {cartSummary.totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                    {cartSummary.totalItems}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-all cursor-pointer"
              >
                {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-4 space-y-3 shadow-xl">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  isActive(link.path)
                    ? 'text-primary bg-primary/5'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {link.name}
              </Link>
            ))}

          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};
export default Navbar;
