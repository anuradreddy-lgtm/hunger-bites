import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { type Order } from '../services/db';
import { FiSearch, FiClock, FiCheck, FiTruck, FiMapPin, FiPhone, FiCalendar, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { GiCookingPot } from 'react-icons/gi';
import { MdOutlineFastfood } from 'react-icons/md';

export const TrackOrder: React.FC = () => {
  const { orders, loadingOrders, refreshOrders, showToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search states
  const [searchVal, setSearchVal] = useState(() => searchParams.get('orderId') || '');
  const [prevOrderId, setPrevOrderId] = useState(() => searchParams.get('orderId') || '');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [matchingOrders, setMatchingOrders] = useState<Order[]>([]);
  const [searched, setSearched] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const orderIdParam = searchParams.get('orderId') || '';
  if (orderIdParam !== prevOrderId) {
    setPrevOrderId(orderIdParam);
    setSearchVal(orderIdParam);
  }

  const findOrder = React.useCallback((query: string) => {
    if (!query.trim()) return;
    
    // 1. Check if exact order ID match
    const matchedById = orders.find(
      (o) => o.id.toLowerCase() === query.trim().toLowerCase()
    );

    if (matchedById) {
      setActiveOrder(matchedById);
      setMatchingOrders([]);
      setSearched(true);
      return;
    }

    // 2. Check if searching by mobile number
    const formattedQuery = query.replace(/\D/g, ''); // keep digits only
    if (formattedQuery.length >= 10) {
      const matchedByPhone = orders.filter((o) => o.phone.replace(/\D/g, '').includes(formattedQuery));
      setMatchingOrders(matchedByPhone);
      setActiveOrder(null);
      setSearched(true);
      if (matchedByPhone.length === 0) {
        showToast('No orders found with that mobile number.', 'info');
      }
      return;
    }

    // If no exact match and not a phone number
    setActiveOrder(null);
    setMatchingOrders([]);
    setSearched(true);
  }, [orders, showToast]);

  // Read URL params
  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    if (orderIdParam) {
      const timer = setTimeout(() => {
        findOrder(orderIdParam);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams, orders, findOrder]); // re-run if orders sync from DB

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) {
      showToast('Please enter an Order ID or Mobile Number', 'warning');
      return;
    }
    
    // Update search query param in URL
    searchParams.set('orderId', searchVal.trim());
    setSearchParams(searchParams);
    findOrder(searchVal);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshOrders();
      showToast('Order status refreshed!', 'success');
    } catch {
      showToast('Failed to refresh data', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  // Status index mapping
  const statuses: Order['status'][] = ['Pending', 'Accepted', 'Preparing', 'Out For Delivery', 'Delivered'];
  const getStatusStep = (status: Order['status']) => {
    if (status === 'Cancelled') return -1;
    return statuses.indexOf(status);
  };

  const currentStep = activeOrder ? getStatusStep(activeOrder.status) : 0;

  const steps = [
    { label: 'Order Placed', desc: 'Awaiting acceptance', icon: <FiClock className="w-5 h-5" /> },
    { label: 'Accepted', desc: 'Order confirmed', icon: <FiCheck className="w-5 h-5" /> },
    { label: 'Preparing', desc: 'Cooking your meal', icon: <GiCookingPot className="w-5 h-5" /> },
    { label: 'Out For Delivery', desc: 'Meal on the way', icon: <FiTruck className="w-5 h-5" /> },
    { label: 'Delivered', desc: 'Bon appetit!', icon: <MdOutlineFastfood className="w-5 h-5" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title Header */}
      <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
        <h1 className="font-display font-extrabold text-4xl text-gray-900 dark:text-white">
          Track Your Hot Meal
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter your unique receipt Order ID or Mobile Number to check real-time progress.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-sm mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="e.g. HB_ORD_L4K1AJ or 9876543210"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-100 dark:border-gray-700/70 bg-gray-50 dark:bg-gray-900 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-8 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            Track Status
          </button>
        </form>
      </div>

      {/* SEARCH RESULTS DETAIL DISPLAY */}
      {loadingOrders ? (
        // Loading animation skeleton
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-sm animate-pulse-slow h-80 flex flex-col justify-between">
          <div className="h-6 w-1/3 bg-gray-100 dark:bg-gray-700 rounded" />
          <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-xl" />
          <div className="h-10 w-full bg-gray-100 dark:bg-gray-700 rounded-xl" />
        </div>
      ) : activeOrder ? (
        // TRACKING SCREEN INTERFACE
        <div className="space-y-6">
          {/* Tracking header card */}
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-50 dark:border-gray-700/50">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</span>
                <h2 className="font-display font-extrabold text-xl text-gray-900 dark:text-white mt-0.5">
                  {activeOrder.id}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-bold border border-gray-100 dark:border-gray-600 cursor-pointer"
                >
                  <FiRefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh Live
                </button>
                {activeOrder.status === 'Cancelled' ? (
                  <span className="px-3.5 py-1.5 bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-extrabold border border-red-200">
                    Cancelled
                  </span>
                ) : (
                  <span className="px-3.5 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-extrabold">
                    {activeOrder.status}
                  </span>
                )}
              </div>
            </div>

            {/* Visual Timeline Steps progress */}
            {activeOrder.status === 'Cancelled' ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/10 border border-red-100/30 text-red-700 dark:text-red-400 rounded-2xl">
                <FiAlertCircle className="w-6 h-6 shrink-0" />
                <div>
                  <p className="font-bold text-sm">Order Cancelled</p>
                  <p className="text-xs opacity-85">This order has been rejected or cancelled by the restaurant management.</p>
                </div>
              </div>
            ) : (
              <div className="py-6 overflow-x-auto">
                <div className="min-w-[600px] flex items-center justify-between relative px-2">
                  {/* Background progress track line */}
                  <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-gray-100 dark:bg-gray-700 -z-0" />
                  
                  {/* Active progress fill line */}
                  <div
                    className="absolute left-8 top-1/2 -translate-y-1/2 h-1 bg-primary -z-0 transition-all duration-500"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 92}%` }}
                  />

                  {/* Steps tags */}
                  {steps.map((step, idx) => {
                    const isCompleted = idx < currentStep;
                    const isActive = idx === currentStep;
                    
                    return (
                      <div key={idx} className="flex flex-col items-center relative z-10 w-28 text-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCompleted
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                            : isActive
                            ? 'bg-white dark:bg-gray-800 border-primary text-primary scale-110 shadow-lg shadow-primary/15'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-400'
                        }`}>
                          {isCompleted ? <FiCheck className="w-5 h-5" /> : step.icon}
                        </div>
                        <span className={`text-xs font-bold mt-2 block ${isActive ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                          {step.label}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-0.5 max-w-[90px] block leading-tight">
                          {step.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Details breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Ordered items summary */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-sm space-y-4">
              <h3 className="font-display font-extrabold text-gray-900 dark:text-white border-b border-gray-50 dark:border-gray-700/50 pb-2">
                Order Items
              </h3>
              <div className="space-y-3">
                {activeOrder.order_items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm gap-2">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.quantity} x ₹{Math.round(item.price)}</p>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      ₹{Math.round(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-gray-50 dark:border-gray-700/50 pt-3 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{Math.round(activeOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST</span>
                  <span>₹{Math.round(activeOrder.gst)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span>₹{Math.round(activeOrder.delivery_charge)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-gray-900 dark:text-white border-t border-dashed border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <span>Grand Total</span>
                  <span className="text-primary text-base">₹{Math.round(activeOrder.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Delivery address details */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-sm space-y-4">
              <h3 className="font-display font-extrabold text-gray-900 dark:text-white border-b border-gray-50 dark:border-gray-700/50 pb-2">
                Delivery Details
              </h3>
              <ul className="space-y-3.5 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2.5">
                  <FiMapPin className="text-primary w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">Delivery Address</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                      {activeOrder.address} {activeOrder.landmark ? `(Landmark: ${activeOrder.landmark})` : ''}
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start gap-2.5">
                  <FiPhone className="text-primary w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">Customer Mobile</p>
                    <p className="text-xs text-gray-400 mt-0.5">{activeOrder.phone}</p>
                  </div>
                </li>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <li className="flex items-start gap-2">
                    <FiCalendar className="text-primary w-4.5 h-4.5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-200 text-xs">Date</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{activeOrder.delivery_date}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiClock className="text-primary w-4.5 h-4.5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-200 text-xs">Target Time</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{activeOrder.delivery_time}</p>
                    </div>
                  </li>
                </div>

                {activeOrder.special_instructions && (
                  <li className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700/50 rounded-xl">
                    <p className="font-bold text-xs text-gray-700 dark:text-gray-300">Instructions:</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 italic">"{activeOrder.special_instructions}"</p>
                  </li>
                )}
              </ul>
            </div>

          </div>
        </div>
      ) : matchingOrders.length > 0 ? (
        // LIST OF MOBILE MATCHING ORDERS
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-sm space-y-4">
          <h3 className="font-display font-extrabold text-gray-900 dark:text-white border-b border-gray-50 dark:border-gray-700/50 pb-2">
            Orders matching search
          </h3>
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {matchingOrders.map((o) => (
              <div
                key={o.id}
                onClick={() => {
                  setActiveOrder(o);
                  setSearchVal(o.id);
                  searchParams.set('orderId', o.id);
                  setSearchParams(searchParams);
                }}
                className="py-4 flex justify-between items-center hover:bg-gray-50/55 dark:hover:bg-gray-700/20 px-2 rounded-xl transition-all cursor-pointer group"
              >
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                    ID: {o.id}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {o.delivery_date} at {o.delivery_time} • {o.order_items.length} items
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg ${
                    o.status === 'Cancelled'
                      ? 'bg-red-100 dark:bg-red-950/20 text-red-600 border border-red-200'
                      : o.status === 'Delivered'
                      ? 'bg-green-100 dark:bg-green-950/20 text-green-600'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {o.status}
                  </span>
                  <span className="font-extrabold text-sm text-gray-800 dark:text-white">
                    ₹{Math.round(o.total_amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : searched ? (
        // NO ORDERS FOUND SEARCH FALLBACK
        <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-sm min-h-[250px] flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center text-3xl mb-4 text-red-500">
            ⚠️
          </div>
          <h3 className="font-bold text-lg text-gray-800 dark:text-white">Order not found</h3>
          <p className="text-sm text-gray-400 dark:text-gray-400 max-w-sm mt-1">
            We couldn't locate any records matching "{searchVal}". Double check your spelling or try searching via mobile number.
          </p>
        </div>
      ) : (
        // DEFAULT NO SEARCH SCREEN
        <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-sm min-h-[250px] flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-orange-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center text-3xl mb-4">
            📦
          </div>
          <h3 className="font-bold text-lg text-gray-850 dark:text-white">No active search</h3>
          <p className="text-sm text-gray-400 dark:text-gray-400 max-w-sm mt-1">
            Input your Order ID from your receipt or your registered 10-digit mobile number to view details.
          </p>
        </div>
      )}

    </div>
  );
};
export default TrackOrder;
