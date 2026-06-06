import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { type Order } from '../../services/db';
import { FiSearch, FiChevronDown, FiChevronUp, FiMapPin, FiPhone, FiCalendar, FiFileText, FiRefreshCw, FiTrash2 } from 'react-icons/fi';

export const AdminOrderManagement: React.FC = () => {
  const { orders, loadingOrders, refreshOrders, updateOrder, removeOrder, showToast } = useApp();
  const [searchParams] = useSearchParams();

  // Search and filter states
  const [searchVal, setSearchVal] = useState(() => searchParams.get('search') || '');
  const [prevSearchParam, setPrevSearchParam] = useState(() => searchParams.get('search') || '');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(() => searchParams.get('search') || null);
  const [refreshing, setRefreshing] = useState(false);

  const searchParam = searchParams.get('search') || '';
  if (searchParam !== prevSearchParam) {
    setPrevSearchParam(searchParam);
    setSearchVal(searchParam);
    if (searchParam) {
      setExpandedOrderId(searchParam);
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete order ${id} permanently?`)) {
      await removeOrder(id);
    }
  };

  // Status values
  const statuses = ['All', 'Pending', 'Accepted', 'Preparing', 'Out For Delivery', 'Delivered', 'Cancelled'];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshOrders();
      showToast('Synced newest orders!', 'success');
    } catch {
      showToast('Sync failed', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: Order['status']) => {
    try {
      await updateOrder(id, status);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  // Filtered orders list
  const filteredOrders = orders.filter((order) => {
    const query = searchVal.trim().toLowerCase();
    const matchesSearch = order.id.toLowerCase().includes(query) ||
      order.customer_name.toLowerCase().includes(query) ||
      order.phone.replace(/\D/g, '').includes(query);

    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Welcome header row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-gray-900 dark:text-white">
            Customer Orders List
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
            Accept pending checkouts, coordinate food preparation, and manage customer pickups.
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:text-primary transition-all flex items-center gap-1.5 text-xs font-bold border border-gray-150 dark:border-gray-700 cursor-pointer disabled:opacity-50"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Sync Orders
        </button>
      </div>

      {/* Query Filters Dashboard */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Order ID, name, mobile..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-105 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-900 text-xs text-gray-805 dark:text-white focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Status filters */}
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
          {statuses.slice(0, 5).map((stat) => (
            <button
              key={stat}
              onClick={() => setSelectedStatus(stat)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                selectedStatus === stat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 text-gray-600 dark:text-gray-300'
              }`}
            >
              {stat === 'Out For Delivery' ? 'Ready For Pickup' : stat === 'Delivered' ? 'Picked Up' : stat}
            </button>
          ))}
          {statuses.length > 5 && (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-50 dark:bg-gray-700 border-none text-gray-600 dark:text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="All" disabled={selectedStatus === 'All'}>More States</option>
              {statuses.slice(5).map((stat) => (
                <option key={stat} value={stat}>
                  {stat === 'Out For Delivery' ? 'Ready For Pickup' : stat === 'Delivered' ? 'Picked Up' : stat}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Orders container */}
      <div className="space-y-4">
        {loadingOrders ? (
          // Loading states
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-sm animate-pulse-slow h-40" />
        ) : filteredOrders.length === 0 ? (
          // Empty state
          <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-sm text-gray-400 text-xs">
            No orders found matching the filter criteria.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            
            return (
              <div
                key={order.id}
                className={`bg-white dark:bg-gray-800 rounded-3xl border shadow-sm transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-primary/20 dark:border-primary/20 ring-1 ring-primary/5'
                    : 'border-gray-100 dark:border-gray-700/60 hover:border-gray-200 dark:hover:border-gray-600'
                }`}
              >
                {/* Main clickable Header row */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Order ID</span>
                      <h4 className="font-display font-extrabold text-sm text-gray-900 dark:text-white mt-0.5">
                        {order.id}
                      </h4>
                    </div>

                    <div className="h-8 w-px bg-gray-105 dark:bg-gray-700 hidden sm:block" />

                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer Details</span>
                      <p className="font-bold text-xs text-gray-800 dark:text-gray-200 mt-0.5">
                        {order.customer_name} • {order.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Amount</span>
                      <span className="font-extrabold text-sm text-primary">
                        ₹{Math.round(order.total_amount)}
                      </span>
                    </div>

                    <span className={`px-2.5 py-1 text-[9px] font-black rounded tracking-wide uppercase ${
                      order.status === 'Cancelled'
                        ? 'bg-red-50 text-red-500 dark:bg-red-950/20 border border-red-200/30'
                        : order.status === 'Delivered'
                        ? 'bg-green-50 text-green-600 dark:bg-green-950/20'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {order.status === 'Out For Delivery' ? 'Ready For Pickup' : order.status === 'Delivered' ? 'Picked Up' : order.status}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(order.id);
                      }}
                      className="p-1.5 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-100/30 cursor-pointer"
                      title="Delete Order Permanently"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>

                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                </div>

                {/* Expanded Details body */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-gray-50 dark:border-gray-700/50 bg-gray-50/20 dark:bg-gray-800/40 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                    
                    {/* Column 1: Items list */}
                    <div className="space-y-3">
                      <h5 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-50 dark:border-gray-700/50 pb-1">
                        Ordered Items
                      </h5>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {order.order_items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                              {item.name} <span className="text-gray-400 font-bold ml-1">x{item.quantity}</span>
                            </span>
                            <span className="font-semibold text-gray-950 dark:text-white">
                              ₹{Math.round(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1.5 border-t border-gray-105 pt-2.5 text-gray-500 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>₹{Math.round(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST</span>
                          <span>₹{Math.round(order.gst)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Takeaway Fee</span>
                          <span>{order.delivery_charge === 0 ? 'Free' : `₹${Math.round(order.delivery_charge)}`}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-dashed border-gray-250 dark:border-gray-700 pt-1.5 mt-1.5">
                          <span>Grand Total</span>
                          <span className="text-primary">₹{Math.round(order.total_amount)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Pickup Info */}
                    <div className="space-y-3">
                      <h5 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-50 dark:border-gray-700/50 pb-1">
                        Pickup Details
                      </h5>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li className="flex gap-2">
                          <FiMapPin className="text-primary w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-gray-750 dark:text-gray-200">Order Type</p>
                            <p className="text-[11px] leading-relaxed mt-0.5">{order.address}</p>
                            {order.landmark && <p className="text-[10px] text-gray-400 mt-0.5">Landmark: {order.landmark}</p>}
                          </div>
                        </li>

                        <li className="flex gap-2">
                          <FiPhone className="text-primary w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-gray-750 dark:text-gray-200">Contact</p>
                            <p className="text-[11px] mt-0.5">{order.customer_name} ({order.phone})</p>
                          </div>
                        </li>

                        <li className="flex gap-2">
                          <FiCalendar className="text-primary w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-gray-750 dark:text-gray-200">Pickup Timing</p>
                            <p className="text-[11px] mt-0.5">{order.delivery_date} at {order.delivery_time}</p>
                          </div>
                        </li>

                        {order.special_instructions && (
                          <li className="flex gap-2 p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-105 dark:border-gray-700/50">
                            <FiFileText className="text-primary w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-[10px] text-gray-750 dark:text-gray-200">Chef Instructions</p>
                              <p className="text-[10px] text-gray-400 mt-0.5 italic">"{order.special_instructions}"</p>
                            </div>
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Column 3: Chef Operations Status Control */}
                    <div className="space-y-3">
                      <h5 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-50 dark:border-gray-700/50 pb-1">
                        Operations Center
                      </h5>
                      <p className="text-[10px] text-gray-400 leading-normal mb-2">
                        Move order status forward. Changing this state updates the customer's tracking details instantly.
                      </p>

                      {/* Status action buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        {order.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(order.id, 'Accepted')}
                              className="py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-center cursor-pointer transition-all shadow-md shadow-primary/10"
                            >
                              Accept Order
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(order.id, 'Cancelled')}
                              className="py-2.5 bg-red-50 hover:bg-red-100 text-red-650 font-bold border border-red-150 rounded-xl text-center cursor-pointer"
                            >
                              Reject Order
                            </button>
                          </>
                        )}
                        
                        {order.status === 'Accepted' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'Preparing')}
                            className="col-span-2 py-2.5 bg-primary text-white font-bold rounded-xl text-center cursor-pointer shadow-md shadow-primary/10 hover:bg-primary-hover"
                          >
                            Mark: Cooking (Preparing)
                          </button>
                        )}

                        {order.status === 'Preparing' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'Out For Delivery')}
                            className="col-span-2 py-2.5 bg-primary text-white font-bold rounded-xl text-center cursor-pointer shadow-md shadow-primary/10 hover:bg-primary-hover"
                          >
                            Mark: Ready for Pickup
                          </button>
                        )}

                        {order.status === 'Out For Delivery' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'Delivered')}
                            className="col-span-2 py-2.5 bg-green-600 text-white font-bold rounded-xl text-center cursor-pointer shadow-md shadow-green-600/10 hover:bg-green-700"
                          >
                            Mark: Picked Up (Completed)
                          </button>
                        )}

                        {(order.status === 'Delivered' || order.status === 'Cancelled') && (
                          <div className="col-span-2 py-3 text-center bg-gray-50 dark:bg-gray-900 border border-gray-105 dark:border-gray-700 rounded-2xl text-[11px] font-semibold text-gray-400">
                            ✓ Process Completed ({order.status})
                          </div>
                        )}
                      </div>

                      {/* Cancel order backup trigger */}
                      {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this active order?')) {
                              handleStatusUpdate(order.id, 'Cancelled');
                            }
                          }}
                          className="w-full text-center text-[10px] text-red-500 font-bold hover:underline pt-2 cursor-pointer"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default AdminOrderManagement;
