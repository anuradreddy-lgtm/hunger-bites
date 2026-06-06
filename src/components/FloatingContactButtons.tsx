import React from 'react';
import { FiMapPin, FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export const FloatingContactButtons: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3.5 items-center">
      {/* Location Button */}
      <a
        href="https://maps.app.goo.gl/dMPNmsEJGBRcxqtd6?g_st=ac"
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white text-2xl shadow-3d hover:shadow-3d-lg hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
        title="Our Location"
      >
        <FiMapPin className="stroke-[2.5]" />
      </a>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/918019100551"
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white text-3xl shadow-3d hover:shadow-3d-lg hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
        title="WhatsApp Support"
      >
        <FaWhatsapp />
      </a>

      {/* Call Button */}
      <a
        href="tel:+918019100551"
        className="w-14 h-14 rounded-full bg-[#1e293b] hover:bg-[#334155] flex items-center justify-center text-white text-2xl shadow-3d hover:shadow-3d-lg hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
        title="Call Us"
      >
        <FiPhone className="stroke-[2.5]" />
      </a>
    </div>
  );
};
