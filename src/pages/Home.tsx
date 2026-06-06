import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { FiArrowRight, FiClock, FiZap, FiAward, FiDollarSign, FiStar, FiPlus } from 'react-icons/fi';
import { TiltCard } from '../components/TiltCard';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { products, addToCart } = useApp();

  // Categories metadata
  const categories = [
    { name: 'Burgers', icon: '🍔', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&auto=format&fit=crop&q=60' },
    { name: 'Pizza', icon: '🍕', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&auto=format&fit=crop&q=60' },
    { name: 'Sandwiches', icon: '🥪', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=150&auto=format&fit=crop&q=60' },
    { name: 'Biryani', icon: '🍛', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=150&auto=format&fit=crop&q=60' },
    { name: 'Chinese', icon: '🥢', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=150&auto=format&fit=crop&q=60' },
    { name: 'Snacks', icon: '🍟', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=150&auto=format&fit=crop&q=60' },
    { name: 'Desserts', icon: '🍰', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=150&auto=format&fit=crop&q=60' },
    { name: 'Beverages', icon: '🥤', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=150&auto=format&fit=crop&q=60' },
  ];

  // Fetch top 4 rated products
  const popularItems = products
    .filter(p => p.available)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100 } }
  };

  return (
    <div className="space-y-20 pb-20 overflow-x-hidden">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 py-16 md:py-24 border-b border-gray-100/50 dark:border-gray-800/40">
        {/* Floating background 3D-like blobs */}
        <div className="absolute top-10 left-10 w-28 h-28 rounded-full bg-primary/10 blur-xl animate-float-3d-slow pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-secondary/15 blur-2xl animate-float-3d pointer-events-none" />
        <div className="absolute top-1/2 left-2/3 -translate-y-1/2 w-32 h-32 rounded-full bg-orange-300/5 blur-3xl animate-float-3d-fast pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Text content */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 text-left"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs tracking-wider uppercase animate-pulse">
                <FiZap /> Hot Self Pickup
              </span>
              <h1 className="font-display font-extrabold text-5xl sm:text-6xl md:text-7xl text-gray-900 dark:text-white leading-tight">
                Fresh Food <br />
                <span className="text-primary">Ready Fast</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg leading-relaxed">
                Hungry? Order from <span className="font-semibold text-primary">Hunger Bites</span>. We serve the freshest, most delicious ingredients cooked to absolute perfection and ready for pickup in minutes.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => navigate('/menu')}
                  className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-3d-glow hover:scale-105 active:scale-95 btn-tactile flex items-center gap-2 cursor-pointer"
                >
                  Order Now <FiArrowRight />
                </button>
              </div>
            </motion.div>

            {/* Illustration/Image wrapped in TiltCard */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative flex justify-center"
            >
              <TiltCard className="relative w-60 h-60 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px]">
                {/* Visual decoration circles */}
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl" />
                <motion.img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80"
                  alt="Delicious food display"
                  className="w-full h-full object-cover rounded-full border-8 border-white dark:border-gray-800 shadow-3d-lg relative z-10 animate-float-3d"
                />
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-gray-900 dark:text-white">
            In the mood for something specific?
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Explore our curated selection of delicious food categories
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4"
        >
          {categories.map((cat) => (
            <TiltCard key={cat.name} maxRotation={15}>
              <motion.div
                variants={itemVariants}
                onClick={() => navigate(`/menu?category=${cat.name}`)}
                className="group cursor-pointer bg-white dark:bg-gray-800 rounded-3xl p-4 border border-white/20 dark:border-gray-750 shadow-3d hover:shadow-3d-lg transition-all text-center flex flex-col items-center h-full"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border border-gray-105 dark:border-gray-700 shadow-inner">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="text-lg font-bold text-gray-850 dark:text-gray-200 block">
                  {cat.name}
                </span>
                <span className="text-xs text-primary font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Go to Menu →
                </span>
              </motion.div>
            </TiltCard>
          ))}
        </motion.div>
      </section>

      {/* 3. Popular Items Section */}
      {popularItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
            <div className="text-center sm:text-left space-y-2">
              <h2 className="font-display font-extrabold text-3xl md:text-4xl text-gray-900 dark:text-white">
                Our Popular Creations
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Highly recommended dishes loved by Hunger Bites customers
              </p>
            </div>
            <button
              onClick={() => navigate('/menu')}
              className="px-6 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              Explore Full Menu <FiArrowRight />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {popularItems.map((product) => {
              const discountedPrice = product.price * (1 - product.discount / 100);
              return (
                <TiltCard key={product.id} className="h-full">
                  <div className="bg-white dark:bg-gray-800 rounded-3xl border border-white/20 dark:border-gray-750 overflow-hidden shadow-3d hover:shadow-3d-lg transition-all group flex flex-col h-full">
                    {/* Food Image Container */}
                    <div className="relative h-28 sm:h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Badge Overlay */}
                      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-1 sm:gap-1.5 z-20">
                        <span className={`text-[8px] sm:text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg shadow-3d ${
                          product.veg_type === 'veg' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {product.veg_type}
                        </span>
                        {product.discount > 0 && (
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

                    {/* Food Content Details */}
                    <div className="p-3 sm:p-5 flex flex-col flex-grow justify-between space-y-2.5 sm:space-y-4">
                      <div className="space-y-0.5 sm:space-y-1">
                        <span className="text-[8px] sm:text-xs text-primary font-bold tracking-wider uppercase">
                          {product.category}
                        </span>
                        <h3 className="font-display font-bold text-xs sm:text-lg text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-400 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      {/* Footer Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2.5 sm:pt-2 border-t border-gray-100 dark:border-gray-700/50 gap-2">
                        <div>
                          <span className="text-sm sm:text-xl font-extrabold text-gray-900 dark:text-white block sm:inline leading-tight">
                            ₹{Math.round(discountedPrice)}
                          </span>
                          {product.discount > 0 && (
                            <span className="text-[10px] sm:text-xs text-gray-400 line-through block sm:inline sm:ml-1 leading-none">
                              ₹{product.price}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => addToCart(product)}
                          className="w-full sm:w-auto px-2 py-1.5 sm:px-3 sm:py-2 bg-primary text-white rounded-xl transition-all shadow-3d-glow hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center btn-tactile text-xs font-bold gap-1"
                          aria-label="Add to cart"
                        >
                          <FiPlus className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                          <span className="sm:hidden">Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Why Choose Us Section */}
      <section className="bg-gray-50 dark:bg-gray-800/40 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-gray-900 dark:text-white">
              Why Hunger Bites?
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We aim to redefine your food ordering experience with stellar services
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <TiltCard>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-white/20 dark:border-gray-750 shadow-3d hover:shadow-3d-lg transition-all flex flex-col items-center text-center h-full">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/20 text-primary flex items-center justify-center text-2xl mb-5 shadow-inner animate-float-3d">
                  <FiClock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Quick Takeaway</h3>
                <p className="text-xs text-gray-400 dark:text-gray-450 leading-relaxed">
                  Piping hot food prepared and ready for self-pickup in 15-20 minutes, guaranteed.
                </p>
              </div>
            </TiltCard>

            <TiltCard>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-white/20 dark:border-gray-750 shadow-3d hover:shadow-3d-lg transition-all flex flex-col items-center text-center h-full">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/20 text-primary flex items-center justify-center text-2xl mb-5 shadow-inner animate-float-3d-slow">
                  <FiAward className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Fresh Ingredients</h3>
                <p className="text-xs text-gray-400 dark:text-gray-450 leading-relaxed">
                  We prepare all recipes using locally-sourced, clean, organic vegetables and high quality meats.
                </p>
              </div>
            </TiltCard>

            <TiltCard>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-white/20 dark:border-gray-750 shadow-3d hover:shadow-3d-lg transition-all flex flex-col items-center text-center h-full">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/20 text-primary flex items-center justify-center text-2xl mb-5 shadow-inner animate-float-3d-fast">
                  <FiDollarSign className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Affordable Pricing</h3>
                <p className="text-xs text-gray-400 dark:text-gray-450 leading-relaxed">
                  Great food does not have to be expensive. Enjoy daily discounts, loyalty points and coupons.
                </p>
              </div>
            </TiltCard>

            <TiltCard>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-white/20 dark:border-gray-750 shadow-3d hover:shadow-3d-lg transition-all flex flex-col items-center text-center h-full">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/20 text-primary flex items-center justify-center text-2xl mb-5 shadow-inner animate-float-3d">
                  <FiStar className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Quality Food</h3>
                <p className="text-xs text-gray-400 dark:text-gray-455 leading-relaxed">
                  Our head chefs are certified and maintain top-tier kitchen hygiene ratings.
                </p>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;
