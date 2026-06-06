import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp, type Toast } from '../context/AppContext';
import { FiCheckCircle, FiInfo, FiAlertTriangle, FiXCircle, FiX } from 'react-icons/fi';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="w-5 h-5 text-green-500 shrink-0" />;
      case 'info':
        return <FiInfo className="w-5 h-5 text-blue-500 shrink-0" />;
      case 'warning':
        return <FiAlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'error':
        return <FiXCircle className="w-5 h-5 text-red-500 shrink-0" />;
    }
  };

  const getBgColor = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-500/20 bg-green-50/90 dark:bg-green-950/20 text-green-800 dark:text-green-200';
      case 'info':
        return 'border-blue-500/20 bg-blue-50/90 dark:bg-blue-950/20 text-blue-800 dark:text-blue-200';
      case 'warning':
        return 'border-amber-500/20 bg-amber-50/90 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200';
      case 'error':
        return 'border-red-500/20 bg-red-50/90 dark:bg-red-950/20 text-red-800 dark:text-red-200';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 left-5 sm:left-auto z-50 flex flex-col gap-3 sm:max-w-sm sm:w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border backdrop-blur-md shadow-lg ${getBgColor(
              toast.type
            )}`}
          >
            <div className="flex items-center gap-3">
              {getIcon(toast.type)}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors ml-2"
            >
              <FiX className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
export default ToastContainer;
