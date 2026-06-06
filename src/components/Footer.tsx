import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FiPhone, FiMapPin, FiClock, FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export const Footer: React.FC = () => {
  const { settings } = useApp();

  return (
    <footer className="bg-dark text-gray-300 dark:bg-gray-950 pt-16 pb-8 mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo & About */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-lg shadow-lg">
                H
              </span>
              <span className="font-display font-black text-lg tracking-tight text-white">
                {settings.restaurant_name}
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Delivering piping hot, fresh, and delicious meals right to your doorstep. Satisfy your hunger cravings with our hand-cooked recipes.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-primary hover:text-white flex items-center justify-center text-gray-400 transition-colors">
                <FiFacebook />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-primary hover:text-white flex items-center justify-center text-gray-400 transition-colors">
                <FiInstagram />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-primary hover:text-white flex items-center justify-center text-gray-400 transition-colors">
                <FiTwitter />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-white text-base mb-5">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-primary transition-colors">View Menu</Link>
              </li>
            </ul>
          </div>

          {/* Operating Hours */}
          <div>
            <h4 className="font-display font-bold text-white text-base mb-5">Business Hours</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-400">
                <FiClock className="text-primary" />
                <div>
                  <p className="text-white font-medium">Daily Operations</p>
                  <p>{settings.business_hours}</p>
                </div>
              </li>
              <li className="text-xs text-gray-500">
                * Note: Delivery timings might vary during public holidays or extreme weather conditions.
              </li>
            </ul>
          </div>

          {/* Address & Contact */}
          <div>
            <h4 className="font-display font-bold text-white text-base mb-5">Get In Touch</h4>
            <ul className="space-y-4 text-sm">
              {settings.address && (
                <li className="flex items-start gap-2.5">
                  <FiMapPin className="text-primary w-5 h-5 shrink-0 mt-0.5" />
                  <span className="leading-relaxed text-gray-400">{settings.address}</span>
                </li>
              )}
              <li className="flex items-center gap-2.5">
                <FiPhone className="text-primary shrink-0" />
                <a href={`tel:+${settings.whatsapp_number}`} className="hover:text-primary transition-colors text-gray-400">
                  +{settings.whatsapp_number}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <FaWhatsapp className="text-primary shrink-0 w-4 h-4" />
                <a
                  href={`https://wa.me/${settings.whatsapp_number}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors text-gray-400"
                >
                  WhatsApp Ordering Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} {settings.restaurant_name}. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
