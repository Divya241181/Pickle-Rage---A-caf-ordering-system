import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as api from "../services/api";
import { supabase } from "../services/supabase";

export default function OrderTracker() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      // We didn't build a single GET /api/orders/{id} endpoint in step 3/4/5?
      // Wait, let's just use supabase directly to fetch the order and its items for simplicity here.
      const res = await supabase
        .from('orders')
        .select('*, order_items(*, menu_items(name, price, image_url))')
        .eq('id', orderId)
        .single();
      
      if (res.data) setOrder(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    const channel = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          setOrder(prev => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!order) return <div className="p-10 text-center">Order not found</div>;

  const statuses = ["pending", "accepted", "preparing", "ready", "served", "completed"];
  const currentIdx = statuses.indexOf(order.status);
  const displayStatus = order.status.charAt(0).toUpperCase() + order.status.slice(1);

  const getStepClass = (stepName) => {
    const stepIdx = statuses.indexOf(stepName);
    if (stepIdx < currentIdx) return "bg-primary text-on-primary"; // completed
    if (stepIdx === currentIdx) return "bg-primary-container border-4 border-primary/20 text-on-primary-container"; // active
    return "bg-surface-variant text-on-surface-variant"; // pending
  };

  const getLineClass = (stepName) => {
    const stepIdx = statuses.indexOf(stepName);
    return stepIdx < currentIdx ? "stepper-line completed" : "stepper-line";
  };

  const icons = {
    pending: "check",
    accepted: "check",
    preparing: "cooking",
    ready: "restaurant_menu",
    served: "done_all",
    completed: "done_all"
  };

  return (
    <>
      <header className="bg-surface/90 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant/30 shadow-sm flex justify-between items-center w-full px-container-margin py-sm">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">restaurant</span>
          <h1 className="text-headline-md font-headline-md font-bold text-primary">Picklerage</h1>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-start w-full max-w-md mx-auto px-container-margin py-xl space-y-xl mb-32">
        <section className="text-center w-full space-y-md animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-container/20 rounded-full mb-md">
            <div className="w-14 h-14 bg-primary-container rounded-full flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-on-primary-container text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
          </div>
          <div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">Order confirmed</h2>
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mt-xs">Order #{order.id.slice(0, 6)}</p>
          </div>
        </section>

        <section className="w-full bg-surface-container-low rounded-lg p-lg shadow-sm border border-outline-variant/20">
          <div className="flex items-center justify-between mb-lg">
            <h3 className="font-headline-md text-headline-md text-on-surface">Live Status</h3>
            <span className="px-3 py-1 bg-primary text-on-primary text-label-sm font-label-sm rounded-full step-pulse">
              {displayStatus}
            </span>
          </div>
          <div className="relative flex flex-col space-y-lg">
            <div className="flex items-center justify-between w-full relative px-2">
              {["pending", "accepted", "preparing", "ready", "served"].map((step, idx) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStepClass(step)}`}>
                      <span className="material-symbols-outlined text-[20px]">{icons[step]}</span>
                    </div>
                  </div>
                  {idx < 4 && <div className={getLineClass(step)}></div>}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between w-full text-center px-0">
              {["Placed", "Accepted", "Preparing", "Ready", "Served"].map((lbl, idx) => (
                <span key={lbl} className={`w-12 font-label-sm text-label-sm ${currentIdx >= idx ? 'text-primary' : 'text-on-surface-variant'} ${currentIdx === idx ? 'font-bold' : ''}`}>
                  {lbl}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full space-y-md">
          <h3 className="font-headline-md text-headline-md text-on-surface px-sm">Order Summary</h3>
          <div className="bg-white rounded-lg p-md shadow-sm border border-outline-variant/10 space-y-md">
            {order.order_items.map((item, idx) => (
              <React.Fragment key={item.id}>
                <div className="flex items-center gap-md">
                  <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-surface-container">
                    <img className="w-full h-full object-cover" src={item.menu_items?.image_url} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h4 className="font-label-md text-on-surface">{item.menu_items?.name}</h4>
                      <span className="font-label-md text-primary">₹{item.unit_price}</span>
                    </div>
                    <p className="text-label-sm text-on-surface-variant">x{item.quantity}</p>
                  </div>
                </div>
                {idx < order.order_items.length - 1 && <div className="h-[1px] bg-outline-variant/20 w-full"></div>}
              </React.Fragment>
            ))}
          </div>
        </section>

        <section className="w-full pt-md flex flex-col items-center">
          <button onClick={() => navigate("/")} className="w-full max-w-xs bg-primary text-on-primary font-label-md py-4 rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center gap-sm">
            <span className="material-symbols-outlined">add</span>
            Add more items
          </button>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-lg pb-safe pt-sm bg-surface/90 backdrop-blur-md border-t border-outline-variant/30 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] z-50 md:hidden">
        <a onClick={() => navigate('/')} className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
          <span className="material-symbols-outlined">menu_book</span>
          <span className="font-label-sm text-label-sm mt-xs">Menu</span>
        </a>
        <a className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 active:scale-95 transition-transform duration-150">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
          <span className="font-label-sm text-label-sm mt-xs">History</span>
        </a>
      </nav>
    </>
  );
}