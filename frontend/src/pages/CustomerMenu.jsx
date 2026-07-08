import React, { useState, useEffect, useContext, useRef } from "react";
import { parseQRParams } from "../utils/qr";
import { CartContext } from "../context/CartContext";
import * as api from "../services/api";
import HeroHeader from "../components/menu/HeroHeader";
import MenuItemCard from "../components/menu/MenuItemCard";
import CartBar from "../components/menu/CartBar";
import Checkout from "../components/modals/Checkout";

export default function CustomerMenu({ tableInfo, session }) {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [waiterModalOpen, setWaiterModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const isManualScroll = useRef(false);
  const manualScrollTimeout = useRef(null);
  const { items, addItem, updateQuantity } = useContext(CartContext);

  useEffect(() => {
    api.getMenu().then(res => {
      const cats = res.data.categories || [];
      setCategories(cats);
      if (cats.length > 0) setActiveCategory(cats[0].id);
    }).catch(err => console.error("Failed to load menu", err));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isManualScroll.current) return;
      
      let currentActive = null;
      categories.forEach((cat) => {
        const el = document.getElementById(`cat-${cat.id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Sticky header + some leeway = ~160px threshold
          if (rect.top <= 160) {
            currentActive = cat.id;
          }
        }
      });
      
      if (currentActive) {
        setActiveCategory(currentActive);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run once to initialize
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories]);

  const handleScrollToCat = (catId) => {
    setActiveCategory(catId);
    isManualScroll.current = true;
    clearTimeout(manualScrollTimeout.current);
    manualScrollTimeout.current = setTimeout(() => {
      isManualScroll.current = false;
    }, 1000); // 1s timeout to allow smooth scrolling to finish

    document.getElementById(`cat-${catId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setCatModalOpen(false);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleWaiter = async (reason) => {
    if (!tableInfo.table_id) return alert("Not seated at a table.");
    try {
      await api.callWaiter({ table_id: tableInfo.table_id, reason });
      setWaiterModalOpen(false);
      showToast(`Waiter called for: ${reason}`);
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
          </div>
        </div>

        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md pt-sm pb-sm border-b border-outline-variant/20">
          <div className="flex items-center px-container-margin gap-md overflow-x-auto pb-1 slim-scrollbar">
            <button onClick={() => setCatModalOpen(true)} className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors active:scale-95">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex items-center gap-sm">
              {categories.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => handleScrollToCat(c.id)} 
                  className={`whitespace-nowrap px-lg py-2 rounded-full font-label-md text-label-md transition-colors ${
                    activeCategory === c.id 
                      ? "bg-primary text-on-primary shadow-sm" 
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-container-margin mt-lg space-y-xl">
          {categories.map(cat => {
            const filteredItems = cat.items.filter(i => 
              i.name.toLowerCase().includes(search.toLowerCase())
            );
            if (filteredItems.length === 0) return null;
            return (
              <div key={cat.id} id={`cat-${cat.id}`} className="space-y-gutter scroll-mt-24">
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
          <div onClick={() => setCheckoutOpen(true)} className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary active:scale-95 transition-transform duration-150 cursor-pointer">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="font-label-sm text-label-sm">My Order</span>
          </div>
          <div onClick={() => setWaiterModalOpen(true)} className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary active:scale-95 transition-transform duration-150 cursor-pointer">
            <span className="material-symbols-outlined">person_raised_hand</span>
            <span className="font-label-sm text-label-sm">Call Waiter</span>
          </div>
        </nav>
      </div>

      {catModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-0 sm:p-container-margin">
          <div className="w-full max-w-lg bg-background rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-slide-up-modal relative">
            <div className="px-container-margin py-md border-b border-outline-variant/20 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-10">
              <h2 className="font-headline-md text-headline-md text-on-surface">Menu Categories</h2>
              <button onClick={() => setCatModalOpen(false)} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant active:scale-95 transition-transform">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-container-margin py-md slim-scroll-green">
              <div className="flex flex-col gap-sm">
                {categories.map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => handleScrollToCat(c.id)} 
                    className={`w-full text-left px-lg py-md rounded-xl font-label-md text-label-md transition-colors flex justify-between items-center ${
                      activeCategory === c.id 
                        ? "bg-primary text-on-primary shadow-sm" 
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className={`font-bold font-label-md ${activeCategory === c.id ? "text-on-primary" : "text-outline"}`}>
                      {c.items?.length || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-primary text-on-primary px-lg py-sm rounded-full shadow-lg font-label-md font-bold animate-fade-in flex items-center gap-2">
          <span className="material-symbols-outlined">check_circle</span>
          {toastMessage}
        </div>
      )}

      {waiterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-0 sm:p-container-margin">
          <div className="bg-surface w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-slide-up-modal flex flex-col max-h-[90vh]">
            <div className="px-xl py-lg border-b border-outline-variant/20 flex items-center justify-between sticky top-0 bg-surface z-10">
              <div>
                <p className="font-label-md text-secondary font-bold uppercase tracking-wider mb-1">TABLE-{tableInfo.table_number}</p>
                <h2 className="font-headline-md text-on-surface m-0 font-bold">Call waiter</h2>
              </div>
              <button onClick={() => setWaiterModalOpen(false)} className="h-10 w-10 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors active:scale-95">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-xl space-y-md overflow-y-auto">
              
              <div className="flex items-center justify-between p-lg border border-outline-variant/30 rounded-2xl hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleWaiter("Water please")}>
                <div className="flex items-center gap-md">
                  <div className="h-12 w-12 rounded-full border border-outline-variant/30 flex items-center justify-center bg-surface-container-low text-blue-500 text-xl shadow-sm">
                    <span className="material-symbols-outlined">water_drop</span>
                  </div>
                  <div>
                    <p className="font-title-md text-on-surface font-bold">Water please</p>
                    <p className="font-body-sm text-on-surface-variant">Notify staff</p>
                  </div>
                </div>
                <span className="font-label-md text-primary font-bold">Select</span>
              </div>
              
              <div className="flex items-center justify-between p-lg border border-outline-variant/30 rounded-2xl hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleWaiter("New order")}>
                <div className="flex items-center gap-md">
                  <div className="h-12 w-12 rounded-full border border-outline-variant/30 flex items-center justify-center bg-surface-container-low text-purple-500 text-xl shadow-sm">
                    <span className="material-symbols-outlined">restaurant</span>
                  </div>
                  <div>
                    <p className="font-title-md text-on-surface font-bold">New order</p>
                    <p className="font-body-sm text-on-surface-variant">Notify staff</p>
                  </div>
                </div>
                <span className="font-label-md text-primary font-bold">Select</span>
              </div>
              
              <div className="flex items-center justify-between p-lg border border-outline-variant/30 rounded-2xl hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleWaiter("Bill Please")}>
                <div className="flex items-center gap-md">
                  <div className="h-12 w-12 rounded-full border border-outline-variant/30 flex items-center justify-center bg-surface-container-low text-gray-500 text-xl shadow-sm">
                    <span className="material-symbols-outlined">receipt_long</span>
                  </div>
                  <div>
                    <p className="font-title-md text-on-surface font-bold">Bill Please</p>
                    <p className="font-body-sm text-on-surface-variant">Notify staff</p>
                  </div>
                </div>
                <span className="font-label-md text-primary font-bold">Select</span>
              </div>

            </div>
          </div>
        </div>
      )}

      <Checkout isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} tableInfo={tableInfo} session={session} onOrderSuccess={() => showToast("Order Placed Successfully!")} />
    </>
  );
}