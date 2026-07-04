import React, { useState, useEffect, useContext } from "react";
import { parseQRParams } from "../utils/qr";
import { CartContext } from "../context/CartContext";
import * as api from "../services/api";
import HeroHeader from "../components/menu/HeroHeader";
import MenuItemCard from "../components/menu/MenuItemCard";
import CartBar from "../components/menu/CartBar";
import Checkout from "../components/modals/Checkout";

export default function CustomerMenu() {
  const [categories, setCategories] = useState([]);
  const [tableInfo, setTableInfo] = useState({ orderType: 'dine_in', table_id: null, table_number: null });
  const [search, setSearch] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { items, addItem, updateQuantity } = useContext(CartContext);

  useEffect(() => {
    const { token, orderType } = parseQRParams();
    
    if (orderType === 'dine_in' && token) {
      api.verifyTable(token).then(res => {
        setTableInfo({ orderType, table_id: res.data.table_id, table_number: res.data.table_number });
      }).catch(err => console.error("Table verification failed", err));
    } else {
      setTableInfo({ orderType: 'takeout', table_id: null, table_number: null });
    }

    api.getMenu().then(res => setCategories(res.data.categories))
      .catch(err => console.error("Failed to load menu", err));
  }, []);

  const handleScrollToCat = (catId) => {
    document.getElementById(`cat-${catId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleWaiter = async () => {
    if (!tableInfo.table_id) return alert("Not seated at a table.");
    try {
      await api.callWaiter({ table_id: tableInfo.table_id, reason: "Customer request" });
      alert("Waiter called!");
    } catch (e) {
      alert("Failed to call waiter");
    }
  };

  return (
    <>
      <HeroHeader tableNumber={tableInfo.table_number} type={tableInfo.orderType} />
      
      <main className="relative z-30 -mt-lg rounded-t-lg bg-background min-h-screen pb-40">
        <div className="px-container-margin pt-xl pb-md">
          <div className="flex flex-col gap-md">
            <div className="relative flex items-center bg-surface-container-low rounded-xl px-md py-sm border border-outline-variant/20 focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant mr-sm">search</span>
              <input value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent border-none focus:ring-0 w-full text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant/50 outline-none" placeholder="Search for dishes..." type="text" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-sm">
                <span className="font-label-md text-label-md text-on-surface-variant">Veg only</span>
                <button onClick={() => setVegOnly(!vegOnly)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${vegOnly ? 'bg-primary' : 'bg-surface-container-highest'}`} role="switch">
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${vegOnly ? 'translate-x-6' : 'translate-x-1'}`}></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md pt-sm pb-md border-b border-outline-variant/20">
          <div className="flex items-center px-container-margin gap-md overflow-x-auto hide-scrollbar">
            <button className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-surface-container-low text-on-surface">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex items-center gap-sm">
              {categories.map(c => (
                <button key={c.id} onClick={() => handleScrollToCat(c.id)} className="whitespace-nowrap px-lg py-2 rounded-full bg-surface-container-low text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high transition-colors">{c.name}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-container-margin mt-lg space-y-xl">
          {categories.map(cat => {
            const filteredItems = cat.items.filter(i => 
              (!vegOnly || i.food_type === 'veg') && 
              i.name.toLowerCase().includes(search.toLowerCase())
            );
            if (filteredItems.length === 0) return null;
            return (
              <div key={cat.id} id={`cat-${cat.id}`} className="space-y-gutter">
                <h2 className="font-headline-md text-headline-md text-on-surface-variant mb-md px-1">{cat.name}</h2>
                {filteredItems.map(item => (
                  <MenuItemCard 
                    key={item.id} 
                    item={item} 
                    quantity={items.find(i => i.id === item.id)?.quantity || 0}
                    onAdd={addItem} 
                    onUpdateQuantity={updateQuantity} 
                  />
                ))}
              </div>
            );
          })}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 px-container-margin pb-safe pt-md">
        <CartBar onCheckout={() => setCheckoutOpen(true)} />
        <nav className="bg-surface/90 backdrop-blur-md border-t border-outline-variant/30 flex justify-around items-center py-sm rounded-t-xl shadow-lg mt-auto">
          <div className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 active:scale-95 transition-transform duration-150 cursor-pointer">
            <span className="material-symbols-outlined">menu_book</span>
            <span className="font-label-sm text-label-sm">Menu</span>
          </div>
          <div className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary active:scale-95 transition-transform duration-150 cursor-pointer">
            <span className="material-symbols-outlined">history</span>
            <span className="font-label-sm text-label-sm">History</span>
          </div>
          <div onClick={handleWaiter} className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary active:scale-95 transition-transform duration-150 cursor-pointer">
            <span className="material-symbols-outlined">person_raised_hand</span>
            <span className="font-label-sm text-label-sm">Call Waiter</span>
          </div>
        </nav>
      </div>

      <Checkout isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} tableInfo={tableInfo} />
    </>
  );
}