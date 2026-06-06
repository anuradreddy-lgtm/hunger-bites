import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FiSearch, FiStar, FiSliders, FiPlus, FiMinus } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { TiltCard } from '../components/TiltCard';

const CATEGORIES = ['All', 'Burgers', 'Pizza', 'Sandwiches', 'Biryani', 'Chinese', 'Snacks', 'Desserts', 'Beverages'];

export const Menu: React.FC = () => {
  const { products, loadingProducts, cart, addToCart, updateCartQuantity } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [maxPrice, setMaxPrice] = useState(500);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Read URL query params (e.g. from Home page category click)
  const categoryParam = searchParams.get('category');
  const selectedCategory = (categoryParam && CATEGORIES.includes(categoryParam)) ? categoryParam : 'All';

  // Handle category tab click
  const handleCategorySelect = (category: string) => {
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  // Find quantity in cart
  const getCartQuantity = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  // Filtered products list
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

    const matchesDiet = dietFilter === 'all' || product.veg_type === dietFilter;

    // Apply discount to compare actual price
    const finalPrice = product.price * (1 - product.discount / 100);
    const matchesPrice = finalPrice <= maxPrice;

    return matchesSearch && matchesCategory && matchesDiet && matchesPrice;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title Header */}
      <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
        <h1 className="font-display font-extrabold text-4xl text-gray-900 dark:text-white">
          Our Delicious Menu
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Fresh, local, and handmade recipes cooked to order. Choose your favorite meal.
        </p>
      </div>

      {/* Main Grid: Filters Sidebar + Products list */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* FILTERS PANEL */}
        <aside className={`lg:block ${showFiltersMobile ? 'block' : 'hidden'} bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-sm space-y-6`}>
          <div className="flex items-center justify-between pb-3 border-b border-gray-50 dark:border-gray-700/50">
            <h3 className="font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiSliders className="text-primary" /> Filter Options
            </h3>
            <button
              onClick={() => {
                setSearchQuery('');
                setDietFilter('all');
                setMaxPrice(500);
                searchParams.delete('category');
                setSearchParams(searchParams);
              }}
              className="text-xs text-primary font-bold hover:underline cursor-pointer"
            >
              Reset All
            </button>
          </div>

          {/* Search bar */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">Search Food</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700/70 bg-gray-50 dark:bg-gray-900 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Food Type Diet Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 block mb-2">Dietary Choice</label>
            <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-gray-900 p-1 rounded-xl">
              <button
                onClick={() => setDietFilter('all')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  dietFilter === 'all'
                    ? 'bg-white dark:bg-gray-800 text-primary shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDietFilter('veg')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  dietFilter === 'veg'
                    ? 'bg-white dark:bg-gray-800 text-green-600 shadow-sm'
                    : 'text-gray-500 hover:text-green-600'
                }`}
              >
                Veg
              </button>
              <button
                onClick={() => setDietFilter('non-veg')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  dietFilter === 'non-veg'
                    ? 'bg-white dark:bg-gray-800 text-red-600 shadow-sm'
                    : 'text-gray-500 hover:text-red-600'
                }`}
              >
                Non-Veg
              </button>
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">
              <span>Max Price</span>
              <span className="text-primary font-extrabold text-sm">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>₹50</span>
              <span>₹500</span>
            </div>
          </div>
        </aside>

        {/* PRODUCTS AREA */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Mobile Filter Toggle & Pills */}
          <div className="flex flex-col gap-4">
            {/* Horizontal Categories Scroll */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 hover:border-primary/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="lg:hidden flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl text-sm font-bold w-full cursor-pointer"
            >
              <FiSliders /> {showFiltersMobile ? 'Hide Filters' : 'Show Advanced Filters'}
            </button>
          </div>

          {/* Load Grid */}
          {loadingProducts ? (
            // Loading Skeletons
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700/60 p-4 space-y-4">
                  <div className="h-44 bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse-slow" />
                  <div className="space-y-2">
                    <div className="h-4 w-1/3 bg-gray-100 dark:bg-gray-700 rounded animate-pulse-slow" />
                    <div className="h-6 w-3/4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse-slow" />
                    <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded animate-pulse-slow" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-8 w-20 bg-gray-100 dark:bg-gray-700 rounded animate-pulse-slow" />
                    <div className="h-10 w-24 bg-gray-100 dark:bg-gray-700 rounded animate-pulse-slow" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-sm min-h-[300px]">
              <div className="w-20 h-20 bg-orange-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center text-3xl mb-4">
                🔍
              </div>
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">No items found</h3>
              <p className="text-sm text-gray-400 dark:text-gray-400 max-w-sm mt-1">
                We couldn't find any dishes matching your exact preferences. Try adjusting the keywords or filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDietFilter('all');
                  setMaxPrice(500);
                  searchParams.delete('category');
                  setSearchParams(searchParams);
                }}
                className="mt-4 px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-hover shadow-md hover:shadow-lg transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            // Food Grid
            <motion.div
              layout
              className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6"
            >
              {filteredProducts.map((product) => {
                const quantity = getCartQuantity(product.id);
                const finalPrice = product.price * (1 - product.discount / 100);
                
                return (
                  <TiltCard key={product.id} className="h-full">
                    <div
                      className={`bg-white dark:bg-gray-800 rounded-3xl border border-white/20 dark:border-gray-750 overflow-hidden shadow-3d hover:shadow-3d-lg transition-all group flex flex-col justify-between h-full ${
                        !product.available ? 'opacity-65' : ''
                      }`}
                    >
                      {/* Food Header Image */}
                      <div className="relative h-28 sm:h-44 overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Out of Stock Layer */}
                        {!product.available && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                            <span className="bg-red-600 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-3d border border-red-500">
                              Sold Out
                            </span>
                          </div>
                        )}

                        {/* Badge Overlays */}
                        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-1 sm:gap-1.5 z-20">
                          <span className={`text-[8px] sm:text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg shadow-3d ${
                            product.veg_type === 'veg' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {product.veg_type}
                          </span>
                          {product.discount > 0 && product.available && (
                            <span className="text-[8px] sm:text-[9px] bg-primary text-white font-extrabold px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg shadow-3d uppercase tracking-wider">
                              {product.discount}% OFF
                            </span>
                          )}
                        </div>

                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg flex items-center gap-0.5 text-[9px] sm:text-[11px] font-bold text-gray-800 dark:text-white shadow-3d z-20">
                          <FiStar className="text-yellow-500 fill-yellow-500" />
                          <span>{product.rating}</span>
                        </div>
                      </div>

                      {/* Food Metadata content */}
                      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-4">
                        <div className="space-y-0.5 sm:space-y-1">
                          <span className="text-[8px] sm:text-[10px] text-primary font-bold tracking-wider uppercase">
                            {product.category}
                          </span>
                          <h3 className="font-display font-bold text-xs sm:text-base text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-400 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        </div>

                        {/* Action trigger row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2.5 sm:pt-3 border-t border-gray-100 dark:border-gray-700/50 gap-2">
                          <div>
                            <span className="text-sm sm:text-lg font-extrabold text-gray-900 dark:text-white block sm:inline leading-tight">
                              ₹{Math.round(finalPrice)}
                            </span>
                            {product.discount > 0 && (
                              <span className="text-[10px] sm:text-xs text-gray-400 line-through block sm:inline sm:ml-1 leading-none">
                                ₹{product.price}
                              </span>
                            )}
                          </div>

                          {/* Interactive Quantity Button or Standard Add */}
                          {!product.available ? (
                            <button
                              disabled
                              className="w-full sm:w-auto px-2 py-1.5 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-700 text-gray-405 dark:text-gray-500 rounded-xl text-[10px] sm:text-xs font-bold border border-gray-200 dark:border-gray-600 cursor-not-allowed text-center"
                            >
                              Sold Out
                            </button>
                          ) : quantity > 0 ? (
                            <div className="flex items-center border border-primary bg-primary/5 rounded-xl overflow-hidden shadow-3d-sm self-stretch sm:self-auto justify-between sm:justify-start">
                              <button
                                onClick={() => updateCartQuantity(product.id, quantity - 1)}
                                className="px-2 py-1.5 sm:px-3 sm:py-2 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                              >
                                <FiMinus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </button>
                              <span className="px-2 sm:px-3 text-xs font-extrabold text-primary">
                                {quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(product.id, quantity + 1)}
                                className="px-2 py-1.5 sm:px-3 sm:py-2 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                              >
                                <FiPlus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(product)}
                              className="w-full sm:w-auto px-2.5 py-1.5 sm:px-4 sm:py-2 bg-primary hover:bg-primary-hover text-white text-[11px] sm:text-xs font-bold rounded-xl transition-all shadow-3d-glow hover:scale-[1.03] cursor-pointer btn-tactile text-center"
                            >
                              Add<span className="hidden sm:inline"> to Cart</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Menu;
