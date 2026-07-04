import { createContext, useState, useEffect } from 'react';

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
