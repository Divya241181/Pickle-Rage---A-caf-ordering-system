import { useState, useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import * as api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function Checkout({ isOpen, onClose, tableInfo }) {
  const { items, total, clearCart } = useContext(CartContext);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handlePlaceOrder = async () => {
    if (!name || !mobile) return alert("Please fill all fields");
    setLoading(true);
    try {
      let sessionId = null;
      if (tableInfo.orderType === 'dine_in' && tableInfo.table_id) {
        const sessionRes = await api.createSession({
          table_id: tableInfo.table_id,
          customer_name: name,
          mobile: mobile,
          guest_count: parseInt(guestCount)
        });
        sessionId = sessionRes.data.id;
      }

      const orderData = {
        session_id: sessionId,
        order_type: tableInfo.orderType,
        customer_name: name,
        mobile: mobile,
        items: items.map(i => ({ menu_item_id: i.id, quantity: i.quantity, unit_price: i.price }))
      };
      
      const orderRes = await api.placeOrder(orderData);
      clearCart();
      navigate(`/order/${orderRes.data.id}`);
    } catch (e) {
      console.error(e);
      alert("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-0 sm:p-container-margin">
      <div className="w-full max-w-lg bg-background rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-slide-up-modal relative">
        <div className="px-container-margin py-md border-b border-outline-variant/20 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-10">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Checkout</h2>
            <p className="text-label-md text-on-surface-variant font-label-md mt-1">{items.length} items • ₹{total}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant active:scale-95 transition-transform">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-container-margin py-lg hide-scrollbar space-y-xl">
          <section>
            <h3 className="font-label-md text-label-md text-primary mb-md uppercase tracking-wider">Your Details</h3>
            <div className="space-y-md">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-xs">Name</label>
                <input value={name} onChange={e => setName(e.target.value)} type="text" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-md py-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-on-surface" placeholder="Enter your name" />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-xs">Mobile Number</label>
                <input value={mobile} onChange={e => setMobile(e.target.value)} type="tel" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-md py-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-on-surface" placeholder="10-digit mobile number" />
              </div>
              {tableInfo.orderType === 'dine_in' && (
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-xs">Number of Guests</label>
                  <div className="flex items-center bg-surface-container-low border border-outline-variant/30 rounded-xl px-md py-sm">
                    <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="text-primary p-1"><span className="material-symbols-outlined">remove</span></button>
                    <input value={guestCount} readOnly type="text" className="flex-1 bg-transparent text-center font-bold text-on-surface border-none outline-none" />
                    <button onClick={() => setGuestCount(guestCount + 1)} className="text-primary p-1"><span className="material-symbols-outlined">add</span></button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
        
        <div className="p-container-margin border-t border-outline-variant/20 bg-surface-container-lowest">
          <button onClick={handlePlaceOrder} disabled={loading} className="w-full bg-primary text-on-primary py-md rounded-full font-bold text-label-md shadow-md active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-sm">
            {loading ? "Placing Order..." : `Pay ₹${total} & Place Order`}
            {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
