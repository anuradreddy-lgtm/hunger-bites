import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FiArrowLeft, FiShoppingBag, FiCalendar, FiClock, FiFileText, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { TiltCard } from '../components/TiltCard';
import { QRCodeSVG } from 'qrcode.react';

const address = 'Takeaway (Self Pickup)';
const landmark = '';

export const Checkout: React.FC = () => {
  const { cart, cartSummary, settings, placeOrder, clearCart, showToast } = useApp();
  const navigate = useNavigate();

  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [deliveryTime, setDeliveryTime] = useState(() => {
    const today = new Date();
    const hours = String(today.getHours()).padStart(2, '0');
    const mins = String(today.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  });
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentOption, setPaymentOption] = useState<'Full' | 'Half'>('Full');
  
  // Computed UPI details
  const amountDue = Math.round(paymentOption === 'Half' ? cartSummary.grandTotal / 2 : cartSummary.grandTotal);
  const upiUrl = `upi://pay?pa=${settings.upi_id || '8019100551@ibl'}&pn=${encodeURIComponent(settings.restaurant_name)}&am=${amountDue}&cu=INR&tn=${encodeURIComponent('Order for ' + name)}`;
  
  // Validation States
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasRedirectedToUpi, setHasRedirectedToUpi] = useState(false);




  // Redirect to menu if cart is empty
  useEffect(() => {
    if (cart.length === 0 && !isSubmitting) {
      navigate('/menu');
    }
  }, [cart, navigate, isSubmitting]);

  const validate = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!name.trim()) tempErrors.name = 'Full name is required';
    if (!phone.trim()) {
      tempErrors.phone = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(phone.trim().replace(/\D/g, ''))) {
      tempErrors.phone = 'Please enter a valid 10-digit mobile number';
    }
    if (!deliveryDate) tempErrors.deliveryDate = 'Pickup date is required';
    if (!deliveryTime) tempErrors.deliveryTime = 'Pickup time is required';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fill all required fields correctly', 'warning');
      return;
    }
    setStep('payment');
  };

  const handleVerifyAndCompleteOrder = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    
    if (utrNumber.trim().length !== 12) {
      setUtrError('Please enter the exact 12-digit transaction UTR number');
      showToast('Invalid UTR Reference Number', 'warning');
      return;
    }

    setIsSubmitting(true);
    setIsVerifying(true);

    // Simulate contacting banking network
    setTimeout(async () => {
      try {
        const amountPaid = paymentOption === 'Full' ? cartSummary.grandTotal : cartSummary.grandTotal / 2;
        const amountRemaining = paymentOption === 'Full' ? 0 : cartSummary.grandTotal / 2;

        // 1. Create order database record
        const order = await placeOrder({
          name,
          phone,
          address,
          landmark,
          deliveryDate,
          deliveryTime,
          specialInstructions,
          paymentOption,
          amountPaid,
          amountRemaining,
          transactionId: utrNumber
        });

        showToast('Payment Verified & Order placed!', 'success');

        // 2. Generate WhatsApp message content
        let itemsText = '';
        order.order_items.forEach((item, index) => {
          itemsText += `\n${index + 1}. ${item.name} x ${item.quantity} = ₹${Math.round(item.price * item.quantity)}`;
        });

        const whatsappMessage = 
`Hello ${settings.restaurant_name},

🟢 *NEW TAKEAWAY ORDER PLACED (ID: ${order.id})*

*Customer Details:*
• *Name:* ${order.customer_name}
• *Mobile:* ${order.phone}
• *Type:* Takeaway (Self Pickup)
• *Pickup Date:* ${order.delivery_date}
• *Pickup Time:* ${order.delivery_time}
${order.special_instructions ? `• *Instructions:* ${order.special_instructions}` : ''}

*Ordered Items:*${itemsText}

*Payment Details:*
• *Payment Option:* ${order.payment_option === 'Half' ? 'Half Payment (50% Upfront)' : 'Full Payment (100% Upfront)'}
• *Amount Paid Upfront:* ₹${Math.round(order.amount_paid || 0)}
• *Remaining Balance:* ₹${Math.round(order.amount_remaining || 0)} ${order.payment_option === 'Half' ? '(To be paid at pickup)' : ''}
• *UTR/Transaction ID:* ${order.transaction_id || 'N/A'} (UPI Verified)

*Order Summary:*
• *Subtotal:* ₹${Math.round(order.subtotal)}
• *GST (${settings.gst_percentage}%):* ₹${Math.round(order.gst)}
• *Takeaway Fee:* Free
• *Grand Total:* ₹${Math.round(order.total_amount)}

Please confirm and accept this order. Thank you!`;

        // Encoded message for URL
        const encodedMsg = encodeURIComponent(whatsappMessage);
        const whatsappUrl = `https://wa.me/${settings.whatsapp_number}?text=${encodedMsg}`;

        // 3. Open WhatsApp link in a new tab
        window.open(whatsappUrl, '_blank');

        // 4. Clean local cart
        clearCart();

        // 5. Navigate to Home page
        navigate('/');

      } catch (err) {
        console.error('Payment complete order error:', err);
        showToast('Could not process order. Please try again.', 'error');
      } finally {
        setIsVerifying(false);
        setIsSubmitting(false);
      }
    }, 2500); // 2.5s simulation latency
  }, [utrNumber, showToast, paymentOption, cartSummary, placeOrder, name, phone, deliveryDate, deliveryTime, specialInstructions, settings, clearCart, navigate]);

  // Listen for browser focus/visibility change to auto-verify payment when returning from the UPI app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && hasRedirectedToUpi) {
        setHasRedirectedToUpi(false);
        
        // Generate a random 12-digit mock UTR transaction number
        const randomUtr = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
        setUtrNumber(randomUtr);
        setUtrError('');
        
        showToast('Returning from UPI App. Autoverifying transaction...', 'info');
        
        // Small delay to allow visual transition back
        setTimeout(() => {
          handleVerifyAndCompleteOrder();
        }, 1500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [hasRedirectedToUpi, handleVerifyAndCompleteOrder, showToast]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header back button */}
      <button
        onClick={() => navigate('/menu')}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors mb-6 cursor-pointer"
      >
        <FiArrowLeft /> Back to Menu
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Checkout fields form */}
        <div className="lg:col-span-2 space-y-6">
          {step === 'details' ? (
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-white/20 dark:border-gray-750 shadow-3d space-y-6">
              <div className="border-b border-gray-50 dark:border-gray-700/50 pb-4">
                <h2 className="font-display font-extrabold text-2xl text-gray-900 dark:text-white">
                  Takeaway Details
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
                  Please provide your contact info and pickup details.
                </p>
              </div>

              <form onSubmit={handleProceedToPayment} className="space-y-4">
                {/* Full Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        errors.name ? 'border-red-500' : 'border-gray-100 dark:border-gray-700/70'
                      } bg-gray-50 dark:bg-gray-900 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-primary`}
                    />
                    {errors.name && <span className="text-[10px] text-red-500 font-semibold">{errors.name}</span>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        errors.phone ? 'border-red-500' : 'border-gray-100 dark:border-gray-700/70'
                      } bg-gray-50 dark:bg-gray-900 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-primary`}
                    />
                    {errors.phone && <span className="text-[10px] text-red-500 font-semibold">{errors.phone}</span>}
                  </div>
                </div>

                {/* Pickup Date & Time slots */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <FiCalendar /> Pickup Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700/70 bg-gray-50 dark:bg-gray-900 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-primary"
                    />
                    {errors.deliveryDate && <span className="text-[10px] text-red-500 font-semibold">{errors.deliveryDate}</span>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <FiClock /> Pickup Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700/70 bg-gray-50 dark:bg-gray-900 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-primary"
                    />
                    {errors.deliveryTime && <span className="text-[10px] text-red-500 font-semibold">{errors.deliveryTime}</span>}
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <FiFileText /> Special Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Make it extra spicy, Leave at the door, Don't ring the bell"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700/70 bg-gray-50 dark:bg-gray-900 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                {/* Payment Option Selection */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <FiCreditCard className="text-primary" /> Payment Preference <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Payment Card */}
                    <TiltCard maxRotation={5} className="cursor-pointer">
                      <div
                        onClick={() => setPaymentOption('Full')}
                        className={`p-4 rounded-2xl border transition-all h-full flex flex-col justify-between select-none ${
                          paymentOption === 'Full'
                            ? 'border-primary bg-primary/5 shadow-3d-glow scale-[1.02]'
                            : 'border-white/10 dark:border-gray-800 bg-white dark:bg-gray-850 hover:border-primary/20 shadow-3d-sm'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-gray-950 dark:text-white">Full Payment</span>
                            <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              paymentOption === 'Full' ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-650'
                            }`}>
                              {paymentOption === 'Full' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 dark:text-gray-455 mt-1 leading-normal">
                            Pay 100% upfront to confirm your order quickly.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100/50 dark:border-gray-700/30 flex justify-between items-baseline">
                          <span className="text-[10px] text-gray-400 font-medium">To Pay Now:</span>
                          <span className="text-base font-extrabold text-primary">₹{Math.round(cartSummary.grandTotal)}</span>
                        </div>
                      </div>
                    </TiltCard>

                    {/* Half Payment Card */}
                    <TiltCard maxRotation={5} className="cursor-pointer">
                      <div
                        onClick={() => setPaymentOption('Half')}
                        className={`p-4 rounded-2xl border transition-all h-full flex flex-col justify-between select-none ${
                          paymentOption === 'Half'
                            ? 'border-primary bg-primary/5 shadow-3d-glow scale-[1.02]'
                            : 'border-white/10 dark:border-gray-800 bg-white dark:bg-gray-855 hover:border-primary/20 shadow-3d-sm'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-gray-950 dark:text-white">Half Payment (50%)</span>
                            <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              paymentOption === 'Half' ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-650'
                            }`}>
                              {paymentOption === 'Half' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 dark:text-gray-455 mt-1 leading-normal">
                            Pay 50% now and pay the remaining balance on delivery.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100/50 dark:border-gray-700/30 flex justify-between items-baseline">
                          <span className="text-[10px] text-gray-400 font-medium">To Pay Now:</span>
                          <span className="text-base font-extrabold text-primary">₹{Math.round(cartSummary.grandTotal / 2)}</span>
                        </div>
                      </div>
                    </TiltCard>
                  </div>
                </div>

                {/* Hidden button to submit form via external action if needed */}
                <button type="submit" className="hidden" id="checkout-form-submit" />
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Back Link */}
              <button
                onClick={() => setStep('details')}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors cursor-pointer"
              >
                <FiArrowLeft /> Back to Delivery Details
              </button>

              <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-white/20 dark:border-gray-750 shadow-3d space-y-6">
                <div className="border-b border-gray-50 dark:border-gray-700/50 pb-4">
                  <h2 className="font-display font-extrabold text-2xl text-gray-900 dark:text-white">
                    Complete Secure Payment
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
                    Scan the QR code or transfer to the UPI ID. Once paid, enter the 12-digit transaction UTR number to complete order.
                  </p>
                </div>

                {/* Summary of due amount */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-850 shadow-inner">
                  <div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-455 font-bold uppercase tracking-wider block">Payment Preference:</span>
                    <span className="text-xs font-extrabold text-gray-800 dark:text-gray-150">
                      {paymentOption === 'Half' ? 'Half Payment (50%)' : 'Full Payment (100%)'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 dark:text-gray-455 font-bold uppercase tracking-wider block">Amount Due Now:</span>
                    <span className="text-base font-black text-primary">
                      ₹{Math.round(paymentOption === 'Half' ? cartSummary.grandTotal / 2 : cartSummary.grandTotal)}
                    </span>
                  </div>
                </div>

                {/* QR Scanner Display styled like the template */}
                <div className="flex flex-col items-center justify-center bg-[#181818] p-6 rounded-3xl border border-white/5 shadow-3d max-w-sm mx-auto text-white">
                  <div className="text-xs font-bold tracking-wider uppercase text-gray-450 mb-4 flex items-center gap-1.5 justify-center">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Bank Of India - 0073
                  </div>
                  
                  {/* Scanner Image Frame (Desktop only) */}
                  <a
                    href={upiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      navigator.clipboard.writeText(settings.upi_id || '8019100551@ibl');
                      showToast('Opening UPI App & copied UPI ID to clipboard!', 'success');
                      setHasRedirectedToUpi(true);
                    }}
                    className="hidden md:flex w-56 h-56 p-1.5 bg-white rounded-xl shadow-inner relative items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 group cursor-pointer"
                    title="Click/Tap to pay via any UPI app"
                  >
                    <QRCodeSVG
                      value={upiUrl}
                      size={220}
                      level="M"
                      includeMargin={true}
                      className="w-full h-full object-contain rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center text-white p-4 text-center">
                      <span className="text-xs font-bold uppercase tracking-wider">Tap to Pay</span>
                      <span className="text-[9px] text-gray-200 mt-1">Opens UPI App directly</span>
                    </div>
                  </a>

                  {/* Pay via App or Copy UPI ID */}
                  <div className="mt-5 w-full text-center space-y-2">
                    <p className="hidden md:block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tap to Pay or Copy UPI ID</p>
                    
                    {/* Mobile Direct UPI App Redirect Button */}
                    <a
                      href={upiUrl}
                      onClick={() => {
                        showToast('Opening UPI App...', 'success');
                        setHasRedirectedToUpi(true);
                      }}
                      className="md:hidden w-full py-3.5 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl border border-transparent transition-all text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-3d-sm hover:-translate-y-0.5 active:translate-y-0.5 text-center btn-tactile font-sans"
                    >
                      <span>Pay via UPI App</span>
                    </a>

                    {/* Desktop UPI App Redirect Button */}
                    <a
                      href={upiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        navigator.clipboard.writeText(settings.upi_id || '8019100551@ibl');
                        showToast('Opening UPI App & copied UPI ID to clipboard!', 'success');
                        setHasRedirectedToUpi(true);
                      }}
                      className="hidden md:flex w-full py-2.5 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl border border-transparent transition-all text-xs font-bold items-center justify-center gap-2 cursor-pointer shadow-3d-sm hover:-translate-y-0.5 active:translate-y-0.5 text-center font-sans"
                    >
                      <span>Pay via UPI App</span>
                    </a>


                    {/* Helper text for Mobile */}
                    <p className="md:hidden text-[10px] text-gray-450 leading-normal max-w-[280px] mx-auto pt-1">
                      Tap above to pay using any UPI app (PhonePe, GPay, Paytm, BHIM, etc.) installed on this device.
                    </p>

                    {/* Desktop UPI ID display and Copy button */}
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(settings.upi_id || '8019100551@ibl');
                        showToast('UPI ID copied to clipboard!', 'success');
                      }}
                      className="hidden md:flex w-full py-2 px-3 bg-[#222] hover:bg-[#2c2c2c] rounded-xl border border-white/5 transition-all text-xs font-semibold text-gray-300 hover:text-white items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="font-mono text-gray-300">{settings.upi_id || '8019100551@ibl'}</span>
                      <span className="text-[9px] bg-gray-700/60 text-gray-300 py-0.5 px-1.5 rounded uppercase tracking-wider font-semibold">Copy</span>
                    </button>
                  </div>
                </div>

                {/* UTR Input Form */}
                <form onSubmit={handleVerifyAndCompleteOrder} className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      UPI Transaction ID / UTR Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      pattern="\d{12}"
                      placeholder="Enter 12-digit UPI UTR ID"
                      value={utrNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, ''); // Numeric only
                        setUtrNumber(val);
                        if (val.length === 12) setUtrError('');
                      }}
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        utrError ? 'border-red-500' : 'border-gray-100 dark:border-gray-700/70'
                      } bg-gray-50 dark:bg-gray-900 text-sm text-gray-800 dark:text-white font-mono focus:outline-none focus:border-primary`}
                    />
                    {utrError ? (
                      <p className="text-[10px] text-red-500 font-semibold">{utrError}</p>
                    ) : (
                      <p className="text-[10px] text-gray-400 leading-normal">
                        Find the 12-digit UTR/Ref number in your UPI app payment receipt details (GPay, PhonePe, Paytm, etc.).
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('details')}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-800 dark:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || isVerifying}
                      className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-all shadow-3d-sm hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer btn-tactile border-b-2 border-b-green-700"
                    >
                      {isVerifying ? 'Verifying...' : 'Verify & Place Order'}
                    </button>
                  </div>

                  {/* Hidden button for layout trigger link */}
                  <button type="submit" className="hidden" id="payment-form-submit" />
                </form>
              </div>
            </div>
          )}
        </div>

        {/* ORDER SUMMARY PANEL */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-white/20 dark:border-gray-750 shadow-3d space-y-6">
            <h3 className="font-display font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-50 dark:border-gray-700/50 pb-3">
              <FiShoppingBag className="text-primary" /> Order Summary
            </h3>

            {/* Product items list */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {cart.map(({ product, quantity }) => {
                const discountedPrice = product.price * (1 - product.discount / 100);
                return (
                  <div key={product.id} className="flex justify-between items-center gap-3 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {quantity} x ₹{Math.round(discountedPrice)}
                      </p>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      ₹{Math.round(discountedPrice * quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations block */}
            <div className="space-y-2.5 border-t border-gray-50 dark:border-gray-700/50 pt-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  ₹{Math.round(cartSummary.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST ({settings.gst_percentage}%)</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  ₹{Math.round(cartSummary.gst)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Takeaway Fee</span>
                <span className="font-bold text-green-500">
                  Free
                </span>
              </div>
              
              <div className="flex justify-between text-base font-extrabold text-gray-900 dark:text-white border-t border-dashed border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <span>Grand Total</span>
                <span className="text-primary text-lg">
                  ₹{Math.round(cartSummary.grandTotal)}
                </span>
              </div>
            </div>

            {/* PLACE WHATSAPP ORDER TRIGGER */}
            {step === 'details' ? (
              <button
                onClick={() => document.getElementById('checkout-form-submit')?.click()}
                disabled={isSubmitting || cart.length === 0}
                className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold transition-all shadow-3d-glow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed btn-tactile"
              >
                <FaWhatsapp className="w-5 h-5 shrink-0" />
                <span>Place Order / Proceed</span>
              </button>
            ) : (
              <button
                onClick={() => document.getElementById('payment-form-submit')?.click()}
                disabled={isSubmitting || isVerifying || cart.length === 0}
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold transition-all shadow-3d-glow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed btn-tactile border-b-green-700"
              >
                <FiCheckCircle className="w-5 h-5 shrink-0" />
                <span>{isVerifying ? 'Verifying...' : 'Verify & Complete Order'}</span>
              </button>
            )}

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100/30">
              <FiClock className="text-primary shrink-0 w-4 h-4 mt-0.5" />
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
                By clicking the checkout button, your details will be recorded in our system, and you will be redirected to WhatsApp to send the receipt details directly to Hunger Bites to confirm your takeaway pickup timing.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Simulated Bank Verification overlay modal */}
      {isVerifying && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-white/20 dark:border-gray-750 shadow-3d-lg max-w-sm w-full text-center space-y-6 animate-float-3d">
            {/* Bank Icon / Loading Spinner */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <FiCreditCard className="w-8 h-8 text-primary animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-display font-extrabold text-xl text-gray-900 dark:text-white">
                Verifying Payment
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-450 leading-relaxed">
                Contacting Bank of India servers to secure your {paymentOption === 'Half' ? '50%' : '100%'} upfront deposit. Please do not close or refresh this tab.
              </p>
            </div>
            
            <div className="text-[10px] text-gray-450 uppercase tracking-widest font-black bg-gray-50 dark:bg-gray-900 py-2 px-4 rounded-xl shadow-inner inline-block">
              UTR: {utrNumber}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
