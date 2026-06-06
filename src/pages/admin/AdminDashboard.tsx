import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FiTrendingUp, FiShoppingBag, FiDollarSign, FiClock, FiEye, FiArrowRight } from 'react-icons/fi';

export const AdminDashboard: React.FC = () => {
  const { orders, products } = useApp();
  const navigate = useNavigate();

  // 1. Calculate Metrics
  const totalOrders = orders.length;
  
  // Total Revenue: sum of all orders except Cancelled ones
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  const totalProducts = products.length;
  
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;

  // Recent 5 orders
  const recentOrders = orders.slice(0, 5);

  const statCards = [
    {
      label: 'Total Orders',
      value: totalOrders,
      icon: <FiShoppingBag className="text-blue-500" />,
      bg: 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-100/30'
    },
    {
      label: 'Total Revenue',
      value: `₹${Math.round(totalRevenue).toLocaleString('en-IN')}`,
      icon: <FiDollarSign className="text-green-500" />,
      bg: 'bg-green-50/50 dark:bg-green-950/10 border-green-100/30'
    },
    {
      label: 'Active Products',
      value: totalProducts,
      icon: <FiTrendingUp className="text-purple-500" />,
      bg: 'bg-purple-50/50 dark:bg-purple-950/10 border-purple-100/30'
    },
    {
      label: 'Pending Orders',
      value: pendingOrdersCount,
      icon: <FiClock className="text-amber-500 animate-pulse" />,
      bg: 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100/30'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome row */}
      <div>
        <h1 className="font-display font-extrabold text-3xl text-gray-900 dark:text-white">
          Welcome back, Admin!
        </h1>
        <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
          Here is what is happening with Hunger Bites operations today.
        </p>
      </div>

      {/* Grid statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-3xl border flex items-center justify-between shadow-sm bg-white dark:bg-gray-800 ${card.bg}`}
          >
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-400 block uppercase tracking-wider">
                {card.label}
              </span>
              <span className="text-2xl font-extrabold text-gray-950 dark:text-white block">
                {card.value}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700/60 flex items-center justify-center text-lg shadow-inner">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders and Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Table of recent orders */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-700/50 pb-3">
            <h3 className="font-display font-extrabold text-gray-900 dark:text-white text-lg">
              Recent Orders
            </h3>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All Orders <FiArrowRight />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              No orders placed yet.
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="overflow-x-auto hidden md:block">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-gray-400 font-bold border-b border-gray-50 dark:border-gray-700/50">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Items</th>
                      <th className="pb-3 text-right">Amount</th>
                      <th className="pb-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700/30">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/20 dark:hover:bg-gray-700/10">
                        <td className="py-3 font-semibold text-gray-900 dark:text-white">{order.id}</td>
                        <td className="py-3">
                          <p className="font-semibold text-gray-850 dark:text-gray-200">{order.customer_name}</p>
                          <p className="text-[10px] text-gray-400">{order.phone}</p>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 text-[9px] font-black rounded ${
                            order.status === 'Cancelled'
                              ? 'bg-red-50 text-red-500 dark:bg-red-950/20 border border-red-200/30'
                              : order.status === 'Delivered'
                              ? 'bg-green-50 text-green-600 dark:bg-green-950/20'
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {order.status === 'Out For Delivery' ? 'Ready For Pickup' : order.status === 'Delivered' ? 'Picked Up' : order.status}
                          </span>
                        </td>
                        <td className="py-3 text-gray-400">
                          {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'}
                        </td>
                        <td className="py-3 text-right font-extrabold text-gray-900 dark:text-white">
                          ₹{Math.round(order.total_amount)}
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => navigate(`/admin/orders?search=${order.id}`)}
                            className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-primary dark:text-gray-400 rounded-lg border border-gray-100 dark:border-gray-650 cursor-pointer"
                            title="View order"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="block md:hidden space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Order ID</span>
                        <span className="font-bold text-xs text-gray-900 dark:text-white">
                          {order.id.slice(-8)}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-black rounded ${
                        order.status === 'Cancelled'
                          ? 'bg-red-50 text-red-500 dark:bg-red-950/20 border border-red-200/30'
                          : order.status === 'Delivered'
                          ? 'bg-green-50 text-green-600 dark:bg-green-950/20'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {order.status === 'Out For Delivery' ? 'Ready For Pickup' : order.status === 'Delivered' ? 'Picked Up' : order.status}
                      </span>
                    </div>

                    <div className="border-t border-b border-gray-100/70 dark:border-gray-800/80 py-2 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-medium">Customer:</span>
                        <span className="font-bold text-gray-850 dark:text-gray-250">{order.customer_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-medium">Phone:</span>
                        <span className="text-gray-650 dark:text-gray-300">{order.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-medium">Items:</span>
                        <span className="text-gray-650 dark:text-gray-300">
                          {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Amount</span>
                        <span className="font-extrabold text-primary text-sm">
                          ₹{Math.round(order.total_amount)}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/admin/orders?search=${order.id}`)}
                        className="p-2 bg-white dark:bg-gray-800 text-gray-500 hover:text-primary dark:text-gray-300 rounded-xl border border-gray-100 dark:border-gray-700 cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-sm"
                        title="View order details"
                      >
                        <FiEye className="w-3.5 h-3.5" /> View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Quick Operations cards */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-sm space-y-6">
          <h3 className="font-display font-extrabold text-gray-900 dark:text-white text-lg border-b border-gray-50 dark:border-gray-700/50 pb-3">
            Quick Actions
          </h3>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/admin/food')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/60 hover:bg-primary hover:text-white group rounded-2xl border border-gray-100 dark:border-gray-700/80 transition-all cursor-pointer text-left"
            >
              <div>
                <p className="font-bold text-sm text-gray-850 dark:text-gray-250 group-hover:text-white">Manage Food Menu</p>
                <p className="text-[10px] text-gray-400 group-hover:text-white/80 mt-0.5">Add, Edit or remove recipe details.</p>
              </div>
              <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
            </button>

            <button
              onClick={() => navigate('/admin/orders')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/60 hover:bg-primary hover:text-white group rounded-2xl border border-gray-100 dark:border-gray-700/80 transition-all cursor-pointer text-left"
            >
              <div>
                <p className="font-bold text-sm text-gray-850 dark:text-gray-250 group-hover:text-white">Manage Kitchen Orders</p>
                <p className="text-[10px] text-gray-400 group-hover:text-white/80 mt-0.5">Accept, prepare and complete customer pickups.</p>
              </div>
              <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
            </button>

            <button
              onClick={() => navigate('/admin/settings')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/60 hover:bg-primary hover:text-white group rounded-2xl border border-gray-100 dark:border-gray-700/80 transition-all cursor-pointer text-left"
            >
              <div>
                <p className="font-bold text-sm text-gray-850 dark:text-gray-250 group-hover:text-white">Configure Storefront</p>
                <p className="text-[10px] text-gray-400 group-hover:text-white/80 mt-0.5">Change tax percentage, takeaway fee details.</p>
              </div>
              <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
export default AdminDashboard;
