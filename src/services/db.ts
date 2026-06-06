import { createClient } from '@supabase/supabase-js';

// Types
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  veg_type: 'veg' | 'non-veg';
  price: number;
  rating: number;
  discount: number; // in percentage
  available: boolean;
  created_at: string;
  hidden?: boolean;
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  landmark?: string;
  delivery_date: string;
  delivery_time: string;
  special_instructions?: string;
  order_items: OrderItem[];
  subtotal: number;
  gst: number;
  delivery_charge: number;
  total_amount: number;
  status: 'Pending' | 'Accepted' | 'Preparing' | 'Out For Delivery' | 'Delivered' | 'Cancelled';
  payment_option?: 'Half' | 'Full';
  amount_paid?: number;
  amount_remaining?: number;
  payment_status?: 'Pending' | 'Partially Paid' | 'Fully Paid';
  transaction_id?: string;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  total_orders: number;
  total_spent: number;
  created_at: string;
}

export interface Settings {
  restaurant_name: string;
  whatsapp_number: string;
  delivery_charge: number;
  gst_percentage: number;
  business_hours: string;
  address: string;
  restaurant_logo: string;
  upi_id: string;
}

// Initial Mock Data
const DEFAULT_SETTINGS: Settings = {
  restaurant_name: 'Hunger Bites',
  whatsapp_number: '918019100551',
  delivery_charge: 40.00,
  gst_percentage: 5.00,
  business_hours: '11:00 AM - 11:00 PM',
  address: '456 Foodie Boulevard, Gourmet District, Delhi - 110001',
  restaurant_logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&auto=format&fit=crop&q=60',
  upi_id: '8019100551@ibl'
};


const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Classic Cheese Burger',
    description: 'Juicy vegetable patty layered with melted cheddar cheese, fresh lettuce, sliced tomatoes, and house-made signature burger sauce.',
    category: 'Burgers',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    veg_type: 'veg',
    price: 180,
    rating: 4.5,
    discount: 10,
    available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'p2',
    name: 'Crispy Double Chicken Burger',
    description: 'Double crispy fried chicken breast fillets topped with liquid cheese, spicy mayo, and pickles inside toasted brioche buns.',
    category: 'Burgers',
    image_url: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&auto=format&fit=crop&q=80',
    veg_type: 'non-veg',
    price: 260,
    rating: 4.7,
    discount: 15,
    available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'p3',
    name: 'Spicy Paneer Tikka Pizza',
    description: 'Soft hand-stretched pizza crust topped with rich marinara sauce, marinated tandoori paneer cubes, capsicum, onions, and gooey mozzarella.',
    category: 'Pizza',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
    veg_type: 'veg',
    price: 320,
    rating: 4.6,
    discount: 5,
    available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'p4',
    name: 'Fiery Chicken Pepperoni Pizza',
    description: 'Classic Italian style pizza loaded with chicken pepperoni slices, spicy jalapenos, loaded mozzarella, and dried oregano seasoning.',
    category: 'Pizza',
    image_url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=80',
    veg_type: 'non-veg',
    price: 390,
    rating: 4.8,
    discount: 0,
    available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'p5',
    name: 'Veg Club Grilled Sandwich',
    description: 'Triple-decker sandwich loaded with cucumbers, tomatoes, bell peppers, mint chutney, and creamy grated processed cheese.',
    category: 'Sandwiches',
    image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80',
    veg_type: 'veg',
    price: 120,
    rating: 4.2,
    discount: 5,
    available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'p6',
    name: 'Tandoori Chicken Sandwich',
    description: 'Smoky shredded tandoori chicken chunks mixed with pepper-mayo spread, enclosed in toasted whole-wheat bread slices.',
    category: 'Sandwiches',
    image_url: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=500&auto=format&fit=crop&q=80',
    veg_type: 'non-veg',
    price: 160,
    rating: 4.4,
    discount: 10,
    available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'p7',
    name: 'Hyderabadi Dum Chicken Biryani',
    description: 'Long-grain aromatic basmati rice cooked on dum layer by layer with succulent chicken pieces marinated in yogurt and traditional spices.',
    category: 'Biryani',
    image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
    veg_type: 'non-veg',
    price: 290,
    rating: 4.9,
    discount: 12,
    available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'p8',
    name: 'Veg Dum Biryani',
    description: 'Flavorsome basmati rice slow-cooked with fresh mixed vegetables, paneer cubes, mint leaves, saffron, and biryani spices.',
    category: 'Biryani',
    image_url: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=80',
    veg_type: 'veg',
    price: 240,
    rating: 4.5,
    discount: 8,
    available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'p9',
    name: 'Schezwan Hakka Noodles',
    description: 'Stir-fried noodles tossed with crunchy colorful bell peppers, spring onions, cabbage, and a spicy homemade Schezwan sauce.',
    category: 'Chinese',
    image_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=80',
    veg_type: 'veg',
    price: 180,
    rating: 4.3,
    discount: 0,
    available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'p10',
    name: 'Gobi Manchurian Dry',
    description: 'Crispy deep-fried cauliflower florets tossed in a sweet, tangy, and spicy umami soy-garlic sauce, garnished with scallions.',
    category: 'Chinese',
    image_url: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=500&auto=format&fit=crop&q=80',
    veg_type: 'veg',
    price: 190,
    rating: 4.4,
    discount: 5,
    available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'p11',
    name: 'Classic Salted French Fries',
    description: 'Crispy, golden potato fingers seasoned with sea salt. Served hot with sweet tomato ketchup.',
    category: 'Snacks',
    image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
    veg_type: 'veg',
    price: 90,
    rating: 4.1,
    discount: 0,
    available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'p12',
    name: 'Garlic Bread Sticks (5 Pcs)',
    description: 'Baked bread sticks flavored with garlic butter, sprinkled with Italian herbs. Served with cheesy dip.',
    category: 'Snacks',
    image_url: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=500&auto=format&fit=crop&q=80',
    veg_type: 'veg',
    price: 130,
    rating: 4.4,
    discount: 10,
    available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'p13',
    name: 'Choco Lava Cake',
    description: 'Decadent chocolate cake with a warm, luscious molten chocolate core that oozes out with every bite.',
    category: 'Desserts',
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
    veg_type: 'veg',
    price: 110,
    rating: 4.8,
    discount: 15,
    available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'p14',
    name: 'Hot Gulab Jamun (2 Pcs)',
    description: 'Traditional Indian sweet made of milk solids, deep-fried and soaked in warm cardamom flavored sugar syrup.',
    category: 'Desserts',
    image_url: 'https://images.unsplash.com/photo-1589135306090-e555248a52ac?w=500&auto=format&fit=crop&q=80',
    veg_type: 'veg',
    price: 60,
    rating: 4.6,
    discount: 0,
    available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'p15',
    name: 'Mocha Cold Coffee',
    description: 'Thick and creamy blended cold coffee combined with chocolate syrup, topped with a scoop of vanilla ice cream.',
    category: 'Beverages',
    image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80',
    veg_type: 'veg',
    price: 140,
    rating: 4.5,
    discount: 10,
    available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'p16',
    name: 'Mint Mojito',
    description: 'A refreshing fizzy drink made with freshly crushed mint leaves, lime chunks, sugar, and chilled soda.',
    category: 'Beverages',
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
    veg_type: 'veg',
    price: 100,
    rating: 4.3,
    discount: 5,
    available: true,
    created_at: new Date().toISOString()
  }
];

// Initialize Supabase if variables exist
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to check and initialize Local Storage Data if running in Demo Mode
const initLocalStorage = () => {
  const settingsStr = localStorage.getItem('hb_settings');
  if (!settingsStr) {
    localStorage.setItem('hb_settings', JSON.stringify(DEFAULT_SETTINGS));
  } else {
    try {
      const parsed = JSON.parse(settingsStr);
      let updated = false;
      if (parsed && parsed.whatsapp_number === '919876543210') {
        parsed.whatsapp_number = '918019100551';
        updated = true;
      }
      if (parsed && !parsed.upi_id) {
        parsed.upi_id = '8019100551@ibl';
        updated = true;
      }
      if (updated) {
        localStorage.setItem('hb_settings', JSON.stringify(parsed));
      }
    } catch (e) {
      console.error('Error parsing settings for migration:', e);
    }
  }
  if (!localStorage.getItem('hb_products')) {
    localStorage.setItem('hb_products', JSON.stringify(DEFAULT_PRODUCTS));
  }
  if (!localStorage.getItem('hb_orders')) {
    localStorage.setItem('hb_orders', JSON.stringify([]));
  }
  if (!localStorage.getItem('hb_customers')) {
    localStorage.setItem('hb_customers', JSON.stringify([]));
  }
};

initLocalStorage();

// DATABASE API
export const db = {
  // SETTINGS API
  async getSettings(): Promise<Settings> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .single();
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.error('Supabase getSettings error, falling back:', err);
      }
    }
    const settingsStr = localStorage.getItem('hb_settings');
    return settingsStr ? JSON.parse(settingsStr) : DEFAULT_SETTINGS;
  },

  async updateSettings(settings: Settings): Promise<Settings> {
    if (supabase) {
      try {
        // Assume single row database settings. Select first row id or insert
        const { data: currentSettings } = await supabase.from('settings').select('id');
        const id = currentSettings && currentSettings.length > 0 ? currentSettings[0].id : 'd290f1ee-6c54-4b01-90e6-d701748f0851';
        
        const { data, error } = await supabase
          .from('settings')
          .upsert({ id, ...settings })
          .select()
          .single();
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.error('Supabase updateSettings error, falling back:', err);
      }
    }
    localStorage.setItem('hb_settings', JSON.stringify(settings));
    return settings;
  },

  // PRODUCTS API
  async getProducts(): Promise<Product[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.error('Supabase getProducts error, falling back:', err);
      }
    }
    const productsStr = localStorage.getItem('hb_products');
    return productsStr ? JSON.parse(productsStr) : DEFAULT_PRODUCTS;
  },

  async addProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: supabase ? (undefined as unknown as string) : 'p_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        // Let Postgres generate UUID
        const supabaseProduct: Partial<Product> = { ...newProduct };
        delete supabaseProduct.id;
        const { data, error } = await supabase
          .from('products')
          .insert(supabaseProduct)
          .select()
          .single();
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.error('Supabase addProduct error, falling back:', err);
      }
    }

    const products = await this.getProducts();
    products.unshift(newProduct);
    localStorage.setItem('hb_products', JSON.stringify(products));
    return newProduct;
  },

  async updateProduct(id: string, updatedFields: Partial<Product>): Promise<Product> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .update(updatedFields)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.error('Supabase updateProduct error, falling back:', err);
      }
    }

    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    
    const updatedProduct = { ...products[index], ...updatedFields };
    products[index] = updatedProduct;
    localStorage.setItem('hb_products', JSON.stringify(products));
    return updatedProduct;
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
        if (error) throw error;
        return true;
      } catch (err) {
        console.error('Supabase deleteProduct error, falling back:', err);
      }
    }

    const products = await this.getProducts();
    const filteredProducts = products.filter(p => p.id !== id);
    localStorage.setItem('hb_products', JSON.stringify(filteredProducts));
    return true;
  },

  async deleteOrder(id: string): Promise<boolean> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', id);
        if (error) throw error;
        return true;
      } catch (err) {
        console.error('Supabase deleteOrder error, falling back:', err);
      }
    }

    const orders = await this.getOrders();
    const filteredOrders = orders.filter(o => o.id !== id);
    localStorage.setItem('hb_orders', JSON.stringify(filteredOrders));
    return true;
  },

  async deleteCustomer(id: string): Promise<boolean> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('customers')
          .delete()
          .eq('id', id);
        if (error) throw error;
        return true;
      } catch (err) {
        console.error('Supabase deleteCustomer error, falling back:', err);
      }
    }

    const customers = await this.getCustomers();
    const filteredCustomers = customers.filter(c => c.id !== id);
    localStorage.setItem('hb_customers', JSON.stringify(filteredCustomers));
    return true;
  },

  // ORDERS API
  async getOrders(): Promise<Order[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.error('Supabase getOrders error, falling back:', err);
      }
    }
    const ordersStr = localStorage.getItem('hb_orders');
    return ordersStr ? JSON.parse(ordersStr) : [];
  },

  async addOrder(order: Omit<Order, 'id' | 'status' | 'created_at'>): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: supabase ? (undefined as unknown as string) : 'hb_ord_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      status: 'Pending',
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        // Let Postgres generate UUID
        const supabaseOrder: Partial<Order> = { ...newOrder };
        delete supabaseOrder.id;
        const { data, error } = await supabase
          .from('orders')
          .insert(supabaseOrder)
          .select()
          .single();
        if (error) throw error;
        
        // Also update customer metrics asynchronously
        this.updateCustomerMetrics(newOrder.customer_name, newOrder.phone, newOrder.total_amount).catch(console.error);
        
        if (data) return data;
      } catch (err) {
        console.error('Supabase addOrder error, falling back:', err);
      }
    }

    const orders = await this.getOrders();
    orders.unshift(newOrder);
    localStorage.setItem('hb_orders', JSON.stringify(orders));
    
    // Update local customers database
    await this.updateCustomerMetrics(newOrder.customer_name, newOrder.phone, newOrder.total_amount);
    
    return newOrder;
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .update({ status })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.error('Supabase updateOrderStatus error, falling back:', err);
      }
    }

    const orders = await this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');
    
    orders[index].status = status;
    localStorage.setItem('hb_orders', JSON.stringify(orders));
    return orders[index];
  },

  async updateOrderPaymentStatus(id: string, paymentStatus: 'Pending' | 'Partially Paid' | 'Fully Paid'): Promise<Order> {
    const orders = await this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');
    
    orders[index].payment_status = paymentStatus;
    if (paymentStatus === 'Fully Paid') {
      orders[index].amount_paid = orders[index].total_amount;
      orders[index].amount_remaining = 0;
    } else if (paymentStatus === 'Partially Paid') {
      orders[index].amount_paid = orders[index].total_amount / 2;
      orders[index].amount_remaining = orders[index].total_amount / 2;
    }
    
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .update({
            payment_status: paymentStatus,
            amount_paid: orders[index].amount_paid,
            amount_remaining: orders[index].amount_remaining
          })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.error('Supabase updateOrderPaymentStatus error, falling back:', err);
      }
    }

    localStorage.setItem('hb_orders', JSON.stringify(orders));
    return orders[index];
  },

  // CUSTOMERS API
  async getCustomers(): Promise<Customer[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('total_spent', { ascending: false });
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.error('Supabase getCustomers error, falling back:', err);
      }
    }
    const customersStr = localStorage.getItem('hb_customers');
    return customersStr ? JSON.parse(customersStr) : [];
  },

  async updateCustomerMetrics(name: string, phone: string, amount: number): Promise<void> {
    if (supabase) {
      try {
        // Upsert customer based on phone
        const { data: existing } = await supabase
          .from('customers')
          .select('*')
          .eq('phone', phone)
          .single();
        
        if (existing) {
          const { error } = await supabase
            .from('customers')
            .update({
              total_orders: existing.total_orders + 1,
              total_spent: parseFloat(existing.total_spent) + amount,
              name // update name in case it changed
            })
            .eq('phone', phone);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('customers')
            .insert({
              name,
              phone,
              total_orders: 1,
              total_spent: amount
            });
          if (error) throw error;
        }
        return;
      } catch (err) {
        console.error('Supabase updateCustomerMetrics error, falling back:', err);
      }
    }

    const customers = await this.getCustomers();
    const index = customers.findIndex(c => c.phone === phone);
    if (index !== -1) {
      customers[index].total_orders += 1;
      customers[index].total_spent += amount;
      customers[index].name = name;
    } else {
      customers.push({
        id: 'c_' + Math.random().toString(36).substr(2, 9),
        name,
        phone,
        total_orders: 1,
        total_spent: amount,
        created_at: new Date().toISOString()
      });
    }
    localStorage.setItem('hb_customers', JSON.stringify(customers));
  }
};
