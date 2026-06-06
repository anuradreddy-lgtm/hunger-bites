import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FiSearch, FiUsers, FiTrendingUp, FiShoppingBag, FiDollarSign, FiTrash2 } from 'react-icons/fi';

export const AdminCustomerManagement: React.FC = () => {
  const { customers, loadingCustomers, removeCustomer } = useApp();
  const [searchVal, setSearchVal] = useState('');

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer profile permanently?')) {
      await removeCustomer(id);
    }
  };

  // 1. Calculate general stats
  const totalCustomers = customers.length;
  
  const totalSpentAll = customers.reduce((sum, c) => sum + Number(c.total_spent), 0);
  
  const averageSpent = totalCustomers > 0 ? totalSpentAll / totalCustomers : 0;
  
  const totalOrders = customers.reduce((sum, c) => sum + c.total_orders, 0);

  // Search filter
  const filteredCustomers = customers.filter((c) => {
    const query = searchVal.trim().toLowerCase();
    return c.name.toLowerCase().includes(query) || c.phone.replace(/\D/g, '').includes(query);
  });

  const cards = [
    { label: 'Unique Customers', value: totalCustomers, icon: <FiUsers className="text-blue-500" /> },
    { label: 'Cumulative Spending', value: `₹${Math.round(totalSpentAll).toLocaleString('en-IN')}`, icon: <FiDollarSign className="text-green-500" /> },
    { label: 'Average Customer Value', value: `₹${Math.round(averageSpent).toLocaleString('en-IN')}`, icon: <FiTrendingUp className="text-purple-500" /> },
    { label: 'Cumulative Orders', value: totalOrders, icon: <FiShoppingBag className="text-amber-500" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-display font-extrabold text-3xl text-gray-900 dark:text-white">
          Customer Metrics Tracker
        </h1>
        <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
          Monitor your customer directory, order counts, and total spending metrics.
        </p>
      </div>

      {/* Grid summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-105 dark:border-gray-700/60 flex items-center justify-between shadow-sm">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">{card.label}</span>
              <span className="text-xl font-extrabold text-gray-900 dark:text-white block">{card.value}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center border border-gray-100 dark:border-gray-700">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Search and Table Box */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-105 dark:border-gray-700/60 shadow-sm space-y-4">
        
        {/* Search Input bar */}
        <div className="relative w-full sm:max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer name or phone..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-105 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-900 text-xs text-gray-850 dark:text-white focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Table Listing */}
        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 text-gray-400 font-bold border-b border-gray-100 dark:border-gray-700/60">
                <th className="p-4">Customer Info</th>
                <th className="p-4">Mobile Number</th>
                <th className="p-4 text-center">Total Orders Placed</th>
                <th className="p-4 text-right">Total Amount Spent</th>
                <th className="p-4 text-right">First Checked-in Date</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/30">
              {loadingCustomers ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 text-xs">
                    Loading customer directory...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 text-xs">
                    No customers match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/20 dark:hover:bg-gray-750/10">
                    <td className="p-4 font-bold text-gray-900 dark:text-white">
                      {customer.name}
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-400">
                      {customer.phone}
                    </td>
                    <td className="p-4 text-center font-bold text-gray-750 dark:text-gray-200">
                      {customer.total_orders}
                    </td>
                    <td className="p-4 text-right font-extrabold text-primary">
                      ₹{Math.round(customer.total_spent).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-right text-gray-400">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="p-1.5 bg-red-50 dark:bg-red-950/20 text-red-655 dark:text-red-400 rounded-lg hover:bg-red-100 transition-colors border border-red-100/30 cursor-pointer"
                        title="Delete Customer Profile"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="block md:hidden space-y-4">
          {loadingCustomers ? (
            <div className="p-8 text-center text-gray-400 text-xs animate-pulse-slow">
              Loading customer directory...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              No customers match your search criteria.
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-2.5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                      {customer.name}
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      First check-in: {new Date(customer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-lg">
                      {customer.total_orders} {customer.total_orders === 1 ? 'Order' : 'Orders'}
                    </span>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="p-1 bg-red-50 dark:bg-red-950/20 text-red-655 dark:text-red-400 rounded-lg hover:bg-red-100 transition-colors border border-red-100/30 cursor-pointer"
                      title="Delete Customer Profile"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800/80 pt-2.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-gray-400 block text-[9px] font-bold uppercase tracking-wider">Mobile</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{customer.phone}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 block text-[9px] font-bold uppercase tracking-wider">Total Spent</span>
                    <span className="font-extrabold text-primary text-sm">
                      ₹{Math.round(customer.total_spent).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
export default AdminCustomerManagement;
