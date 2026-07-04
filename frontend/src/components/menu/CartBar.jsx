import { useContext } from 'react';
import { CartContext } from '../../context/CartContext';

export default function CartBar({ onCheckout }) {
  const { items, total } = useContext(CartContext);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-container-margin pb-safe pt-md">
      <div className="mb-sm flex justify-center animate-slide-up">
        <div className="flex items-center justify-between w-full max-w-md bg-surface-container-high/90 backdrop-blur-md border border-outline-variant/30 p-2 rounded-full shadow-lg">
          <div className="flex items-center gap-md px-lg">
            <div className="flex flex-col">
              <span className="text-label-sm font-label-md text-on-surface-variant uppercase tracking-wider">{itemCount} {itemCount === 1 ? 'Item' : 'Items'}</span>
              <span className="text-headline-md font-bold text-on-surface">₹{total}</span>
            </div>
          </div>
          <button onClick={onCheckout} className="bg-primary text-on-primary px-xl py-md rounded-full font-bold flex items-center gap-sm shadow-md active:scale-95 transition-transform">
            <span className="">Place Order</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
