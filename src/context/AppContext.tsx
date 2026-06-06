import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, type Product, type Order, type Customer, type Settings, type OrderItem } from '../services/db';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartSummary: {
    totalItems: number;
    subtotal: number;
    gst: number;
    deliveryCharge: number;
    grandTotal: number;
  };

  // Products
  products: Product[];
  loadingProducts: boolean;
  refreshProducts: () => Promise<void>;
  createProduct: (product: Omit<Product, 'id' | 'created_at'>) => Promise<Product>;
  editProduct: (id: string, product: Partial<Product>) => Promise<Product>;
  removeProduct: (id: string) => Promise<boolean>;

  // Orders
  orders: Order[];
  loadingOrders: boolean;
  refreshOrders: () => Promise<void>;
  placeOrder: (customerDetails: {
    name: string;
    phone: string;
    address?: string;
    landmark?: string;
    deliveryDate: string;
    deliveryTime: string;
    specialInstructions?: string;
    paymentOption?: 'Half' | 'Full';
    amountPaid?: number;
    amountRemaining?: number;
    transactionId?: string;
  }) => Promise<Order>;
  updateOrder: (id: string, status: Order['status']) => Promise<Order>;
  updateOrderPaymentStatus: (id: string, paymentStatus: 'Pending' | 'Partially Paid' | 'Fully Paid') => Promise<Order>;
  removeOrder: (id: string) => Promise<boolean>;

  // Customers
  customers: Customer[];
  loadingCustomers: boolean;
  refreshCustomers: () => Promise<void>;
  removeCustomer: (id: string) => Promise<boolean>;

  // Settings
  settings: Settings;
  loadingSettings: boolean;
  saveSettings: (settings: Settings) => Promise<void>;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('hb_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('hb_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Business States
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  
  const [settings, setSettings] = useState<Settings>({
    restaurant_name: 'Hunger Bites',
    whatsapp_number: '918019100551',
    delivery_charge: 40.00,
    gst_percentage: 5.00,
    business_hours: '11:00 AM - 11:00 PM',
    address: '',
    restaurant_logo: '',
    upi_id: '8019100551@ibl'
  });
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Toasts State
  const [toasts, setToasts] = useState<Toast[]>([]);
  const recentToastsRef = React.useRef<{ [message: string]: number }>({});

  // Apply theme class on mount and change
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('hb_theme', theme);
  }, [theme]);

  // Sync cart with localStorage
  useEffect(() => {
    localStorage.setItem('hb_cart', JSON.stringify(cart));
  }, [cart]);



  // Toast actions
  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = React.useCallback((message: string, type: Toast['type'] = 'success') => {
    const now = Date.now();
    const lastShown = recentToastsRef.current[message];
    if (lastShown && now - lastShown < 500) {
      return;
    }
    recentToastsRef.current[message] = now;

    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, [removeToast]);



  // Theme Toggle
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    showToast(`Switched to ${theme === 'light' ? 'Dark' : 'Light'} Mode`, 'info');
  };

  // Cart Operations
  const addToCart = (product: Product, quantity = 1) => {
    if (!product.available) {
      showToast(`${product.name} is currently out of stock.`, 'warning');
      return;
    }
    
    const isExisting = cart.some((item) => item.product.id === product.id);
    
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, quantity }];
      }
    });

    if (isExisting) {
      showToast(`Increased ${product.name} quantity in cart!`, 'success');
    } else {
      showToast(`${product.name} added to cart!`, 'success');
    }
  };

  const removeFromCart = (productId: string) => {
    const item = cart.find(c => c.product.id === productId);
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
    if (item) {
      showToast(`${item.product.name} removed from cart.`, 'info');
    }
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === productId);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity = quantity;
        return updated;
      }
      return prev;
    });
  };

  const clearCart = () => {
    setCart([]);
    showToast('Shopping cart cleared.', 'info');
  };

  // Cart Summary calculations
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => {
    const discountedPrice = item.product.price * (1 - item.product.discount / 100);
    return sum + (discountedPrice * item.quantity);
  }, 0);
  const gst = subtotal * (settings.gst_percentage / 100);
  const deliveryCharge = 0; // Takeaway only, no delivery fee
  const grandTotal = subtotal + gst + deliveryCharge;

  // DB Sync functions
  const refreshProducts = React.useCallback(async () => {
    setLoadingProducts(true);
    try {
      const data = await db.getProducts();
      setProducts(data);
    } catch {
      showToast('Error loading products from database', 'error');
    } finally {
      setLoadingProducts(false);
    }
  }, [showToast]);

  const createProduct = async (prodData: Omit<Product, 'id' | 'created_at'>) => {
    try {
      const newProd = await db.addProduct(prodData);
      setProducts((prev) => [newProd, ...prev]);
      showToast('Product added successfully!', 'success');
      return newProd;
    } catch (err) {
      showToast('Failed to add product', 'error');
      throw err;
    }
  };

  const editProduct = async (id: string, updatedFields: Partial<Product>) => {
    try {
      const updated = await db.updateProduct(id, updatedFields);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showToast('Product updated successfully!', 'success');
      return updated;
    } catch (err) {
      showToast('Failed to update product', 'error');
      throw err;
    }
  };

  const removeProduct = async (id: string) => {
    try {
      await db.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('Product deleted successfully.', 'info');
      return true;
    } catch {
      showToast('Failed to delete product', 'error');
      return false;
    }
  };

  const refreshOrders = React.useCallback(async () => {
    setLoadingOrders(true);
    try {
      const data = await db.getOrders();
      setOrders(data);
    } catch {
      showToast('Error fetching orders', 'error');
    } finally {
      setLoadingOrders(false);
    }
  }, [showToast]);

  const placeOrder = async (customerDetails: {
    name: string;
    phone: string;
    address?: string;
    landmark?: string;
    deliveryDate: string;
    deliveryTime: string;
    specialInstructions?: string;
    paymentOption?: 'Half' | 'Full';
    amountPaid?: number;
    amountRemaining?: number;
    transactionId?: string;
  }) => {
    const orderItems: OrderItem[] = cart.map((item) => ({
      product_id: item.product.id,
      name: item.product.name,
      price: item.product.price * (1 - item.product.discount / 100),
      quantity: item.quantity,
      image_url: item.product.image_url
    }));

    const finalPaymentOption: 'Half' | 'Full' = customerDetails.paymentOption || 'Full';
    const finalAmountPaid = customerDetails.amountPaid !== undefined ? customerDetails.amountPaid : grandTotal;
    const finalAmountRemaining = customerDetails.amountRemaining !== undefined ? customerDetails.amountRemaining : 0;
    const finalPaymentStatus: 'Pending' | 'Partially Paid' | 'Fully Paid' = 'Pending';

    const orderData = {
      customer_name: customerDetails.name,
      phone: customerDetails.phone,
      address: customerDetails.address || 'Takeaway (Self Pickup)',
      landmark: customerDetails.landmark || '',
      delivery_date: customerDetails.deliveryDate,
      delivery_time: customerDetails.deliveryTime,
      special_instructions: customerDetails.specialInstructions,
      order_items: orderItems,
      subtotal,
      gst,
      delivery_charge: deliveryCharge,
      total_amount: grandTotal,
      payment_option: finalPaymentOption,
      amount_paid: finalAmountPaid,
      amount_remaining: finalAmountRemaining,
      payment_status: finalPaymentStatus,
      transaction_id: customerDetails.transactionId
    };

    try {
      const response = await db.addOrder(orderData);
      setOrders((prev) => [response, ...prev]);
      
      // Update customers listing in background
      refreshCustomers().catch(console.error);
      
      return response;
    } catch (err) {
      showToast('Failed to place order', 'error');
      throw err;
    }
  };

  const updateOrder = async (id: string, status: Order['status']) => {
    try {
      const updated = await db.updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      showToast(`Order status updated to: ${status}`, 'success');
      return updated;
    } catch (err) {
      showToast('Failed to update order status', 'error');
      throw err;
    }
  };

  const updateOrderPaymentStatus = async (id: string, paymentStatus: 'Pending' | 'Partially Paid' | 'Fully Paid') => {
    try {
      const updated = await db.updateOrderPaymentStatus(id, paymentStatus);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      showToast(`Order payment status updated to: ${paymentStatus}`, 'success');
      return updated;
    } catch (err) {
      showToast('Failed to update order payment status', 'error');
      throw err;
    }
  };

  const removeOrder = async (id: string) => {
    try {
      await db.deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      showToast('Order deleted successfully.', 'info');
      refreshCustomers().catch(console.error);
      return true;
    } catch {
      showToast('Failed to delete order', 'error');
      return false;
    }
  };

  const refreshCustomers = React.useCallback(async () => {
    setLoadingCustomers(true);
    try {
      const data = await db.getCustomers();
      setCustomers(data);
    } catch {
      showToast('Error syncing customers', 'error');
    } finally {
      setLoadingCustomers(false);
    }
  }, [showToast]);

  const removeCustomer = async (id: string) => {
    try {
      await db.deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      showToast('Customer profile deleted.', 'info');
      return true;
    } catch {
      showToast('Failed to delete customer', 'error');
      return false;
    }
  };

  const refreshSettings = React.useCallback(async () => {
    setLoadingSettings(true);
    try {
      const data = await db.getSettings();
      setSettings(data);
    } catch {
      showToast('Error syncing settings', 'error');
    } finally {
      setLoadingSettings(false);
    }
  }, [showToast]);

  const saveSettings = async (newSettings: Settings) => {
    try {
      const data = await db.updateSettings(newSettings);
      setSettings(data);
      showToast('Settings saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save settings', 'error');
      throw err;
    }
  };

  // Fetch initial data
  useEffect(() => {
    const initData = async () => {
      try {
        await Promise.all([
          refreshSettings(),
          refreshProducts(),
          refreshOrders(),
          refreshCustomers()
        ]);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };
    initData();
  }, [refreshSettings, refreshProducts, refreshOrders, refreshCustomers]);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSummary: { totalItems, subtotal, gst, deliveryCharge, grandTotal },
        products,
        loadingProducts,
        refreshProducts,
        createProduct,
        editProduct,
        removeProduct,
        orders,
        loadingOrders,
        refreshOrders,
        placeOrder,
        updateOrder,
        updateOrderPaymentStatus,
        removeOrder,
        customers,
        loadingCustomers,
        refreshCustomers,
        removeCustomer,
        settings,
        loadingSettings,
        saveSettings,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
