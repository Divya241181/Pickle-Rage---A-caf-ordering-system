import os

base_dir = r'd:\Projects\Pickel Rage\frontend\src'

def make_dirs(paths):
    for p in paths:
        os.makedirs(os.path.join(base_dir, p), exist_ok=True)

make_dirs(['pages', 'components/menu', 'components/modals', 'components/kitchen', 'components/billing', 'context', 'hooks', 'services', 'utils'])

# api.js
api_js = '''import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const getMenu = () => api.get('/api/menu/');
export const verifyTable = (token) => api.get(`/api/tables/verify?token=${token}`);
export const createSession = (data) => api.post('/api/sessions/', data);
export const placeOrder = (data) => api.post('/api/orders/', data);
export const getOrderStatus = (orderId) => api.get(`/api/orders/${orderId}/status`);
export const callWaiter = (data) => api.post('/api/waiter/', data);

export const getKitchenOrders = () => api.get('/api/kitchen/orders');
export const updateKitchenStatus = (orderId, status) => api.patch(`/api/kitchen/${orderId}/status`, { status });

export const getBillingOrders = () => api.get('/api/billing/orders');
export const getBillingStats = () => api.get('/api/billing/stats');
export const confirmPayment = (orderId, data) => api.post(`/api/billing/${orderId}/payment`, data);
export const completeOrder = (orderId) => api.patch(`/api/billing/${orderId}/complete`);

export const getWaiterCalls = () => api.get('/api/waiter/calls');
export const acknowledgeWaiterCall = (callId) => api.patch(`/api/waiter/calls/${callId}/acknowledge`);
'''
with open(os.path.join(base_dir, 'services', 'api.js'), 'w') as f: f.write(api_js)

# supabase.js
supabase_js = '''import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
'''
with open(os.path.join(base_dir, 'services', 'supabase.js'), 'w') as f: f.write(supabase_js)

# qr.js
qr_js = '''export function parseQRParams() {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('t')
  const type = params.get('type')
  if (type === 'takeout') return { orderType: 'takeout', token: null }
  if (token) return { orderType: 'dine_in', token }
  return { orderType: 'dine_in', token: null }
}
'''
with open(os.path.join(base_dir, 'utils', 'qr.js'), 'w') as f: f.write(qr_js)

# CartContext.jsx
cart_ctx = '''import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = sessionStorage.getItem('cartItems');
    return saved ? JSON.parse(saved) : [];
  });
  
  useEffect(() => {
    sessionStorage.setItem('cartItems', JSON.stringify(items));
  }, [items]);
  
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const addItem = (newItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === newItem.id);
      if (existing) {
        return prev.map(i => i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  };
  
  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };
  
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) return removeItem(id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  };
  
  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, total, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
'''
with open(os.path.join(base_dir, 'context', 'CartContext.jsx'), 'w') as f: f.write(cart_ctx)

# useRealtime.js
realtime_js = '''import { useEffect } from 'react';
import { supabase } from '../services/supabase';

export function useOrdersRealtime(onUpdate) {
  useEffect(() => {
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => onUpdate(payload)
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}
'''
with open(os.path.join(base_dir, 'hooks', 'useRealtime.js'), 'w') as f: f.write(realtime_js)

print("Setup files written.")
