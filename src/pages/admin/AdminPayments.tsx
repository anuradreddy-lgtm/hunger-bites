import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FiSearch, FiDollarSign, FiTrendingUp, FiAlertCircle, FiCheckCircle, FiUser, FiCalendar, FiPhone, FiTrash2 } from 'react-icons/fi';
import { TiltCard } from '../../components/TiltCard';

export const AdminPayments: React.FC = () => {
  const { orders, updateOrderPaymentStatus, removeOrder } = useApp();

  const handleDelete = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete this payment record and order ${id} permanently?`)) {
      await removeOrder(id);
    }
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [preferenceFilter, setPreferenceFilter] = useState<'All' | 'Full' | 'Half'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Fully Paid' | 'Partially Paid' | 'Pending'>('All');

  // Calculations
  const metrics = orders.reduce(
    (acc, order) => {
      const option = order.payment_option || 'Full';
      const status = order.payment_status || 'Fully Paid';
      const paid = order.amount_paid !== undefined ? order.amount_paid : order.total_amount;
      const remaining = order.amount_remaining !== undefined ? order.amount_remaining : 0;

      if (status === 'Fully Paid') {
        acc.totalCollected += paid;
      } else if (status === 'Partially Paid') {
        acc.totalCollected += paid;
        acc.totalOutstanding += remaining;
      } else if (status === 'Pending') {
        acc.totalOutstanding += order.total_amount;
      }

      if (option === 'Full') {
        acc.fullPaymentsCount += 1;
      } else {
        acc.halfPaymentsCount += 1;
      }

      return acc;
    },
    { totalCollected: 0, totalOutstanding: 0, fullPaymentsCount: 0, halfPaymentsCount: 0 }
  );

  // Filtered orders list
  const filteredOrders = orders.filter((order) => {
    const option = order.payment_option || 'Full';
    const status = order.payment_status || 'Fully Paid';

    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery);

    const matchesPreference = preferenceFilter === 'All' || option === preferenceFilter;
    const matchesStatus = statusFilter === 'All' || status === statusFilter;

    return matchesSearch && matchesPreference && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Page Header */}
      <div>
        <h1 className="font-display font-extrabold text-3xl text-gray-900 dark:text-white">
          Payments Console
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track upfront deposits, customer payment preferences, and collect outstanding balances.
        </p>
      </div>

      {/* 2. Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Collected */}
        <TiltCard maxRotation={5}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-white/20 dark:border-gray-750 shadow-3d hover:shadow-3d-lg transition-all h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-450 uppercase tracking-wider">
                Total Collected
              </span>
              <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center text-lg shadow-inner">
                <FiCheckCircle />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                ₹{Math.round(metrics.totalCollected)}
              </span>
              <p className="text-[10px] text-gray-400 mt-1">
                Upfront deposits and completed sales.
              </p>
            </div>
          </div>
        </TiltCard>

        {/* Total Outstanding */}
        <TiltCard maxRotation={5}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-white/20 dark:border-gray-750 shadow-3d hover:shadow-3d-lg transition-all h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-450 uppercase tracking-wider">
                Outstanding Balance
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg shadow-inner">
                <FiAlertCircle />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-black text-amber-500">
                ₹{Math.round(metrics.totalOutstanding)}
              </span>
              <p className="text-[10px] text-gray-400 mt-1">
                Collectable balance from partial orders.
              </p>
            </div>
          </div>
        </TiltCard>

        {/* Full upfront counts */}
        <TiltCard maxRotation={5}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-white/20 dark:border-gray-750 shadow-3d hover:shadow-3d-lg transition-all h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-450 uppercase tracking-wider">
                Full Payments
              </span>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shadow-inner">
                <FiDollarSign />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                {metrics.fullPaymentsCount}
              </span>
              <p className="text-[10px] text-gray-400 mt-1">
                Orders with 100% upfront payment.
              </p>
            </div>
          </div>
        </TiltCard>

        {/* Half upfront counts */}
        <TiltCard maxRotation={5}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-white/20 dark:border-gray-750 shadow-3d hover:shadow-3d-lg transition-all h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-450 uppercase tracking-wider">
                Partial Payments
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-lg shadow-inner">
                <FiTrendingUp />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                {metrics.halfPaymentsCount}
              </span>
              <p className="text-[10px] text-gray-400 mt-1">
                Orders with 50% upfront payment.
              </p>
            </div>
          </div>
        </TiltCard>
      </div>

      {/* 3. Filter Controls */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-white/10 dark:border-gray-750 shadow-3d flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Order ID, Name, Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Preference filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-450 uppercase tracking-wider">Choice:</span>
            <select
              value={preferenceFilter}
              onChange={(e) => setPreferenceFilter(e.target.value as 'All' | 'Full' | 'Half')}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
            >
              <option value="All">All Choices</option>
              <option value="Full">Full Payment</option>
              <option value="Half">Half Payment</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-455 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Fully Paid' | 'Partially Paid' | 'Pending')}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Verification</option>
              <option value="Fully Paid">Fully Paid</option>
              <option value="Partially Paid">Partially Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Payments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-white/20 dark:border-gray-750 shadow-3d overflow-hidden">
        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-400 dark:text-gray-550">
              <p className="text-lg font-bold">No payments found</p>
              <p className="text-xs mt-1">Adjust search parameters or place new customer orders.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <table className="hidden md:table w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 text-[10px] uppercase tracking-wider font-extrabold text-gray-400 dark:text-gray-450">
                    <th className="py-4 px-6">Order ID & Date</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Preference</th>
                    <th className="py-4 px-6 text-right">Grand Total</th>
                    <th className="py-4 px-6 text-right">Paid Upfront</th>
                    <th className="py-4 px-6 text-right">Remaining Due</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-sm text-gray-700 dark:text-gray-300">
                  {filteredOrders.map((order) => {
                    const option = order.payment_option || 'Full';
                    const paid = order.amount_paid !== undefined ? order.amount_paid : order.total_amount;
                    const remaining = order.amount_remaining !== undefined ? order.amount_remaining : 0;
                    const status = order.payment_status || 'Fully Paid';

                    return (
                      <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750/30 transition-colors">
                        {/* ID & Date */}
                        <td className="py-4.5 px-6">
                          <div className="font-extrabold text-gray-900 dark:text-white">
                            #{order.id.slice(-8)}
                          </div>
                          {order.transaction_id && (
                            <div className="text-[10px] text-primary font-bold mt-0.5 font-mono">
                              UTR: {order.transaction_id}
                            </div>
                          )}
                          <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                            <FiCalendar /> {order.delivery_date}
                          </div>
                        </td>

                        {/* Customer info */}
                        <td className="py-4.5 px-6">
                          <div className="font-bold flex items-center gap-1 text-gray-850 dark:text-gray-200">
                            <FiUser className="text-gray-400" /> {order.customer_name}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                            <FiPhone /> {order.phone}
                          </div>
                        </td>

                        {/* Preference Choice */}
                        <td className="py-4.5 px-6">
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-3d-sm ${
                            option === 'Full'
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                          }`}>
                            {option === 'Full' ? 'Full Upfront' : 'Half (50%)'}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="py-4.5 px-6 text-right font-bold text-gray-900 dark:text-white">
                          ₹{Math.round(order.total_amount)}
                        </td>

                        {/* Paid */}
                        <td className="py-4.5 px-6 text-right font-extrabold text-green-500">
                          ₹{Math.round(paid)}
                        </td>

                        {/* Remaining */}
                        <td className="py-4.5 px-6 text-right font-extrabold text-amber-500">
                          ₹{Math.round(remaining)}
                        </td>

                        {/* Status */}
                        <td className="py-4.5 px-6 text-center">
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-3d-sm inline-block ${
                            status === 'Fully Paid'
                              ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                              : status === 'Partially Paid'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse'
                              : 'bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse'
                          }`}>
                            {status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4.5 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {status === 'Pending' ? (
                              <button
                                onClick={() => updateOrderPaymentStatus(order.id, option === 'Full' ? 'Fully Paid' : 'Partially Paid')}
                                className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-3d-sm hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer btn-tactile border-b-2 border-b-orange-700"
                              >
                                {option === 'Full' ? 'Verify Payment' : 'Verify Deposit'}
                              </button>
                            ) : status === 'Partially Paid' ? (
                              <button
                                onClick={() => updateOrderPaymentStatus(order.id, 'Fully Paid')}
                                className="px-3.5 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-all shadow-3d-sm hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer btn-tactile border-b-2 border-b-green-700"
                              >
                                Collect Balance
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400 dark:text-gray-550 font-bold">
                                Complete
                              </span>
                            )}
                            <button
                              onClick={() => handleDelete(order.id)}
                              className="p-1.5 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-lg hover:bg-red-100 transition-colors border border-red-100/30 cursor-pointer"
                              title="Delete Payment Record"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile Card List View */}
              <div className="block md:hidden p-4 space-y-4">
                {filteredOrders.map((order) => {
                  const option = order.payment_option || 'Full';
                  const paid = order.amount_paid !== undefined ? order.amount_paid : order.total_amount;
                  const remaining = order.amount_remaining !== undefined ? order.amount_remaining : 0;
                  const status = order.payment_status || 'Fully Paid';

                  return (
                    <div key={order.id} className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-extrabold text-gray-900 dark:text-white">
                            #{order.id.slice(-8)}
                          </div>
                          {order.transaction_id && (
                            <div className="text-[10px] text-primary font-bold font-mono mt-0.5">
                              UTR: {order.transaction_id}
                            </div>
                          )}
                          <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                            <FiCalendar /> {order.delivery_date}
                          </div>
                        </div>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-lg shadow-3d-sm ${
                          option === 'Full'
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                        }`}>
                          {option === 'Full' ? 'Full Upfront' : 'Half (50%)'}
                        </span>
                      </div>

                      <div className="border-t border-b border-gray-100/70 dark:border-gray-800/80 py-2 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-medium">Customer:</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{order.customer_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-medium">Phone:</span>
                          <span className="text-gray-650 dark:text-gray-300">{order.phone}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <div className="space-y-0.5">
                          <div className="flex gap-1.5">
                            <span className="text-gray-400">Total:</span>
                            <span className="font-bold text-gray-900 dark:text-white">₹{Math.round(order.total_amount)}</span>
                          </div>
                          <div className="flex gap-1.5 text-green-500 font-semibold">
                            <span>Paid:</span>
                            <span className="font-extrabold">₹{Math.round(paid)}</span>
                          </div>
                          {remaining > 0 && (
                            <div className="flex gap-1.5 text-amber-500 font-semibold">
                              <span>Due:</span>
                              <span className="font-extrabold">₹{Math.round(remaining)}</span>
                            </div>
                          )}
                        </div>

                        <div className="text-right space-y-2">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-lg shadow-3d-sm inline-block ${
                            status === 'Fully Paid'
                              ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                              : status === 'Partially Paid'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse'
                              : 'bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse'
                          }`}>
                            {status}
                          </span>
                          <div className="flex items-center gap-1.5 justify-end">
                            {status === 'Pending' && (
                              <button
                                onClick={() => updateOrderPaymentStatus(order.id, option === 'Full' ? 'Fully Paid' : 'Partially Paid')}
                                className="px-3 py-1 bg-primary hover:bg-primary-hover text-white rounded-xl text-[10px] font-bold transition-all shadow-3d-sm btn-tactile border-b-2 border-b-orange-700 text-center"
                              >
                                Verify
                              </button>
                            )}
                            {status === 'Partially Paid' && (
                              <button
                                onClick={() => updateOrderPaymentStatus(order.id, 'Fully Paid')}
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-xl text-[10px] font-bold transition-all shadow-3d-sm btn-tactile border-b-2 border-b-green-700 text-center"
                              >
                                Collect
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(order.id)}
                              className="p-1 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-lg hover:bg-red-100 transition-colors border border-red-100/30 cursor-pointer"
                              title="Delete Payment Record"
                            >
                              <FiTrash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminPayments;
