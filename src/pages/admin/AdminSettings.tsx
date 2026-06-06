import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FiSave, FiInfo, FiSliders, FiEye } from 'react-icons/fi';

export const AdminSettings: React.FC = () => {
  const { settings, loadingSettings, saveSettings, showToast } = useApp();

  // Settings states
  const [restaurantName, setRestaurantName] = useState(() => settings?.restaurant_name || '');
  const [whatsappNumber, setWhatsappNumber] = useState(() => settings?.whatsapp_number || '');
  const [deliveryCharge, setDeliveryCharge] = useState(() => Number(settings?.delivery_charge ?? 40));
  const [gstPercentage, setGstPercentage] = useState(() => Number(settings?.gst_percentage ?? 5));
  const [businessHours, setBusinessHours] = useState(() => settings?.business_hours || '');
  const [address, setAddress] = useState(() => settings?.address || '');
  const [restaurantLogo, setRestaurantLogo] = useState(() => settings?.restaurant_logo || '');
  const [upiId, setUpiId] = useState(() => settings?.upi_id || '');

  const [saving, setSaving] = useState(false);

  // Sync settings state when loaded from Context/DB during render
  const [prevSettings, setPrevSettings] = useState(settings);
  if (settings !== prevSettings) {
    setPrevSettings(settings);
    if (settings) {
      setRestaurantName(settings.restaurant_name);
      setWhatsappNumber(settings.whatsapp_number);
      setDeliveryCharge(Number(settings.delivery_charge));
      setGstPercentage(Number(settings.gst_percentage));
      setBusinessHours(settings.business_hours);
      setAddress(settings.address);
      setRestaurantLogo(settings.restaurant_logo || '');
      setUpiId(settings.upi_id || '');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantName.trim()) {
      showToast('Restaurant name is required', 'warning');
      return;
    }
    if (!whatsappNumber.trim()) {
      showToast('WhatsApp phone number is required', 'warning');
      return;
    }
    if (!upiId.trim()) {
      showToast('UPI ID is required', 'warning');
      return;
    }


    setSaving(true);
    try {
      await saveSettings({
        restaurant_name: restaurantName,
        whatsapp_number: whatsappNumber,
        delivery_charge: deliveryCharge,
        gst_percentage: gstPercentage,
        business_hours: businessHours,
        address,
        restaurant_logo: restaurantLogo,
        upi_id: upiId
      });
      showToast('Settings updated successfully!', 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-display font-extrabold text-3xl text-gray-900 dark:text-white">
          Global Storefront Settings
        </h1>
        <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
          Adjust branding assets, taxes, shipping surcharges, hours, and receipt targets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Settings fields Form */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-105 dark:border-gray-700/60 shadow-sm">
          
          <div className="border-b border-gray-50 dark:border-gray-700/50 pb-4 mb-6">
            <h3 className="font-display font-extrabold text-lg text-gray-905 dark:text-white flex items-center gap-2">
              <FiSliders className="text-primary" /> Store Parameters
            </h3>
          </div>

          {loadingSettings ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              Loading current configuration parameters...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Branding Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Restaurant Name *</label>
                  <input
                    type="text"
                    required
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-105 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-900 text-xs text-gray-805 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Logo Image URL</label>
                  <input
                    type="url"
                    value={restaurantLogo}
                    onChange={(e) => setRestaurantLogo(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-105 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-900 text-xs text-gray-805 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* WhatsApp details (Receipt lines target) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  Target WhatsApp Delivery Number (with country code) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 918019100551"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-105 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-900 text-xs text-gray-805 dark:text-white focus:outline-none focus:border-primary"
                />
                <p className="text-[10px] text-gray-400 leading-normal pt-0.5">
                  Write the phone number with country prefix but without `+`, spaces or hyphens. This is the endpoint where customers submit their receipts via WhatsApp.
                </p>
              </div>

              {/* UPI ID */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  Target UPI ID for Payments *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 8019100551@ibl"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-105 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-900 text-xs text-gray-805 dark:text-white focus:outline-none focus:border-primary"
                />
                <p className="text-[10px] text-gray-400 leading-normal pt-0.5">
                  This UPI ID receives customer payments when they click "Pay via UPI App" on mobile or scan the QR code on desktop.
                </p>
              </div>

              {/* Delivery and GST charges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Delivery Charge (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-105 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-900 text-xs text-gray-805 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Tax Percentage (GST %)</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={gstPercentage}
                    onChange={(e) => setGstPercentage(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-105 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-900 text-xs text-gray-805 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Business hours */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Business Hours</label>
                <input
                  type="text"
                  placeholder="e.g. 10:00 AM - 11:00 PM"
                  value={businessHours}
                  onChange={(e) => setBusinessHours(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-105 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-900 text-xs text-gray-805 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Restaurant Operations Address</label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-105 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-900 text-xs text-gray-805 dark:text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Submit btn */}
              <div className="pt-4 border-t border-gray-50 dark:border-gray-700/50">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-primary/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <FiSave />
                  <span>{saving ? 'Saving changes...' : 'Save Configuration'}</span>
                </button>
              </div>

            </form>
          )}
        </div>

        {/* Configurations preview widget */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-105 dark:border-gray-700/60 shadow-sm space-y-6">
          <h3 className="font-display font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-50 dark:border-gray-700/50 pb-3">
            <FiEye className="text-primary" /> Storefront Preview
          </h3>

          <div className="space-y-4 text-xs text-gray-500 dark:text-gray-400">
            {restaurantLogo && (
              <div className="flex justify-center">
                <img
                  src={restaurantLogo}
                  alt="Restaurant Logo"
                  className="w-16 h-16 rounded-2xl object-cover border border-gray-100 dark:border-gray-700"
                />
              </div>
            )}
            
            <div className="space-y-2 border-b border-gray-50 dark:border-gray-700 pb-3">
              <p className="text-center font-bold text-sm text-gray-850 dark:text-white">
                {restaurantName || 'Restaurant Name'}
              </p>
              <p className="text-center text-[10px] text-gray-400 leading-none">
                Open Hours: {businessHours || 'Not configured'}
              </p>
            </div>

            <div className="space-y-2 border-b border-gray-50 dark:border-gray-700 pb-3">
              <div className="flex justify-between">
                <span>Shipping Fees:</span>
                <span className="font-bold text-gray-800 dark:text-white">₹{deliveryCharge}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes (GST):</span>
                <span className="font-bold text-gray-800 dark:text-white">{gstPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span>Target UPI ID:</span>
                <span className="font-bold text-gray-800 dark:text-white truncate max-w-[150px]">{upiId || 'None'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/30">
              <FiInfo className="text-blue-500 shrink-0 w-4 h-4 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-gray-550 dark:text-gray-400">
                Persistent updates to these settings are synced to database layers. Customers will see these changes immediately when loading the Checkout or Footer pages.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default AdminSettings;
