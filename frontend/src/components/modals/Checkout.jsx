import { useState, useContext, useEffect } from 'react';
import { CartContext } from '../../context/CartContext';
import * as api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function Checkout({ isOpen, onClose, tableInfo, session, onOrderSuccess }) {
  const { items, total, clearCart } = useContext(CartContext);
  const [alreadyPlaced, setAlreadyPlaced] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && session?.id) {
      setFetching(true);
      api.getSessionOrders(session.id).then(res => {
        // Flatten items from all orders in this session
        const combinedItems = {};
        res.data.forEach(order => {
          if (order.items) {
            order.items.forEach(item => {
              const id = item.menu_item_id || item.menu_items?.name;
              if (!combinedItems[id]) {
                combinedItems[id] = { 
                  ...item, 
                  status_breakdown: { [order.status]: item.quantity }
                };
              } else {
                combinedItems[id].quantity += item.quantity;
                combinedItems[id].status_breakdown[order.status] = (combinedItems[id].status_breakdown[order.status] || 0) + item.quantity;
              }
            });
          }
        });
        setAlreadyPlaced(Object.values(combinedItems));
      }).catch(err => {
        console.error("Failed to fetch session orders", err);
      }).finally(() => {
        setFetching(false);
      });
    }
  }, [isOpen, session]);

  if (!isOpen) return null;

  const handlePlaceOrder = async () => {
    if (items.length === 0) return alert("Your cart is empty");
    setLoading(true);
    try {
      // If no session exists (e.g. takeout), we would need name/mobile, but for now we assume session exists if dine_in
      let currentSessionId = session ? session.id : null;

      const orderData = {
        session_id: currentSessionId,
        order_type: tableInfo.orderType,
        customer_name: session?.customer_name || "Guest",
        mobile: session?.mobile || "0000000000",
        items: items.map(i => ({ menu_item_id: i.id, quantity: i.quantity, unit_price: i.price }))
      };
      
      const orderRes = await api.placeOrder(orderData);
      clearCart();
      
      if (onOrderSuccess) onOrderSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      alert("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const grandTotal = total + alreadyPlaced.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-0 sm:p-container-margin">
      <div className="w-full max-w-lg bg-background rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-slide-up-modal relative">
        <div className="px-container-margin py-md border-b border-outline-variant/20 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-10">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Your Orders</h2>
            {tableInfo.table_number && <p className="text-label-md text-on-surface-variant font-label-md mt-1">Table {tableInfo.table_number}</p>}
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant active:scale-95 transition-transform">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-container-margin py-md hide-scrollbar space-y-xl">
          
          {items.length > 0 && (
            <section>
              <h3 className="font-label-md text-label-md text-primary mb-sm uppercase tracking-wider">New Items</h3>
              <div className="space-y-sm bg-surface-container-lowest rounded-xl p-sm border border-outline-variant/30">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-xs">
                    <div>
                      <span className="font-label-md text-on-surface">{item.quantity}x </span>
                      <span className="font-body-md text-on-surface">{item.name}</span>
                    </div>
                    <span className="font-label-md text-on-surface">₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="border-t border-outline-variant/20 pt-sm mt-sm flex justify-between items-center">
                  <span className="font-label-md text-on-surface-variant">Subtotal</span>
                  <span className="font-label-md text-on-surface">₹{total}</span>
                </div>
              </div>
            </section>
          )}

          {alreadyPlaced.length > 0 && (
            <section>
              <h3 className="font-label-md text-label-md text-on-surface-variant mb-sm uppercase tracking-wider">Already Placed</h3>
              <div className="space-y-sm bg-surface-container-low/50 rounded-xl p-sm border border-outline-variant/20">
                {fetching ? (
                  <p className="text-sm text-on-surface-variant">Loading...</p>
                ) : (
                  <>
                    {alreadyPlaced.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-xs opacity-80">
                        <div>
                          <span className="font-label-md text-on-surface-variant">{item.quantity}x </span>
                          <span className="font-body-md text-on-surface-variant">{item.menu_items?.name || 'Item'}</span>
                          {item.status_breakdown && Object.entries(item.status_breakdown).map(([status, count]) => (
                            <span key={status} className="ml-sm text-[10px] uppercase font-bold text-primary bg-primary-fixed-dim/30 px-2 py-0.5 rounded-sm tracking-wide">
                              {count > 1 ? `${count} ` : ''}{status === 'pending' ? 'Ordered' : status}
                            </span>
                          ))}
                        </div>
                        <span className="font-label-md text-on-surface-variant">₹{item.unit_price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="border-t border-outline-variant/20 pt-sm mt-sm flex justify-between items-center">
                      <span className="font-label-md text-on-surface-variant">Total Bill So Far</span>
                      <span className="font-label-md text-on-surface font-bold">₹{alreadyPlaced.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0)}</span>
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          {items.length === 0 && alreadyPlaced.length === 0 && !fetching && (
            <div className="text-center py-xl text-on-surface-variant">
              No orders placed yet.
            </div>
          )}

        </div>
        
        {items.length > 0 && (
          <div className="p-container-margin border-t border-outline-variant/20 bg-surface-container-lowest">
            <button onClick={handlePlaceOrder} disabled={loading} className="w-full bg-primary text-on-primary py-md rounded-full font-bold text-label-md shadow-md active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-sm">
              {loading ? "Placing Order..." : `Place Order (₹${total})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
