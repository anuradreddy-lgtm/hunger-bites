import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, updateCartQuantity, removeFromCart, clearCart, cartSummary, settings } = useApp();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiShoppingBag className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Your Basket</h3>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">
                  {cartSummary.totalItems} {cartSummary.totalItems === 1 ? 'item' : 'items'}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-orange-50 dark:bg-gray-700/50 flex items-center justify-center">
                    <FiShoppingBag className="w-10 h-10 text-primary animate-bounce" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">Your cart is empty</p>
                    <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">
                      Add delicious meals to satisfy your hunger!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/menu');
                    }}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg shadow-primary/20"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                cart.map(({ product, quantity }) => {
                  const finalPrice = product.price * (1 - product.discount / 100);
                  return (
                    <motion.div
                      layout
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700/50"
                    >
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">
                              {product.name}
                            </h4>
                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                              product.veg_type === 'veg' 
                                ? 'text-green-600 bg-green-50 dark:bg-green-950/20 border-green-200' 
                                : 'text-red-600 bg-red-50 dark:bg-red-950/20 border-red-200'
                            }`}>
                              {product.veg_type}
                            </span>
                          </div>
                          
                          {/* Price Tag */}
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="font-bold text-sm text-gray-900 dark:text-white">
                              ₹{Math.round(finalPrice * quantity)}
                            </span>
                            {product.discount > 0 && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{product.price * quantity}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                            <button
                              onClick={() => updateCartQuantity(product.id, quantity - 1)}
                              className="px-2 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <FiMinus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-semibold text-gray-800 dark:text-gray-200">
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(product.id, quantity + 1)}
                              className="px-2 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <FiPlus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(product.id)}
                            className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer Order Summary */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80 space-y-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <button
                    onClick={clearCart}
                    className="hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <FiTrash2 /> Empty Cart
                  </button>
                  <span>Prices inclusive of discount</span>
                </div>

                <div className="space-y-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₹{Math.round(cartSummary.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>GST ({settings.gst_percentage}%)</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₹{Math.round(cartSummary.gst)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>Takeaway Fee</span>
                    <span className="font-semibold text-green-500">
                      Free
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white border-t border-dashed border-gray-200 dark:border-gray-700 pt-2 mt-2">
                    <span>Grand Total</span>
                    <span className="text-primary">
                      ₹{Math.round(cartSummary.grandTotal)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold transition-all shadow-3d-glow flex items-center justify-center gap-2 mt-2 btn-tactile cursor-pointer"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default CartDrawer;
