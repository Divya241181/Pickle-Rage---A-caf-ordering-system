import React, { useState, useEffect } from "react";
import * as api from "../services/api";
import { useOrdersRealtime } from "../hooks/useRealtime";

const formatTime = (mins) => {
  const d = Math.floor(mins / 1440).toString().padStart(2, '0');
  const h = Math.floor((mins % 1440) / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${d}:${h}:${m}`;
};
const OrderCard = ({ order, onAction, actionLabel, actionColor }) => {
  const mins = Math.floor(order.elapsed_seconds / 60);
  
  let borderColor = "border-emerald-500";
  let timeColor = "text-on-surface-variant";
  
  if (mins >= 20) {
    borderColor = "border-red-500";
    timeColor = "text-red-400 font-bold";
  } else if (mins >= 10) {
    borderColor = "border-amber-500";
    timeColor = "text-amber-400 font-bold";
  }

  return (
    <div className={`order-card bg-surface-container-high rounded-lg overflow-hidden relative border-l-4 ${borderColor}`}>
      <div className="p-md">
        <div className="flex justify-between items-start mb-sm">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-headline-md text-on-surface font-bold tracking-tight">
                {order.order_type === 'takeout' ? 'Takeaway' : `Table ${order.table_number}`}
              </span>
              {order.order_type === 'dine_in' && order.round_number && (
                <span className="font-label-md text-primary bg-primary-fixed-dim/20 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                  Round {order.round_number}
                </span>
              )}
            </div>
            <p className="text-on-surface-variant font-label-md mt-1">
              {order.customer_name} <span className="text-outline/50 text-[10px] ml-1">#{order.id.slice(0, 4)}</span>
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.order_type === 'takeout' ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            {order.order_type.replace('_', '-')}
          </span>
        </div>
        
        <div className="space-y-sm py-md border-y border-outline-variant/10">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center">
              <span className="font-mono text-primary-fixed-dim font-bold w-8">{item.quantity}x</span>
              <span className="text-on-surface">{item.name}</span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-md">
          <span className={`${timeColor} text-sm flex items-center gap-1`}>
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            {formatTime(mins)} ago
          </span>
          {onAction ? (
            <button onClick={() => onAction(order)} className={`h-12 text-white font-bold px-lg rounded-full transition-all active:scale-95 ${actionColor}`}>
              {actionLabel}
            </button>
          ) : (
            <span className="material-symbols-outlined text-emerald-500 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>room_service</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default function KitchenDashboard() {
  const [orders, setOrders] = useState({ pending: [], accepted: [], preparing: [], ready: [] });
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  const fetchOrders = async () => {
    try {
      const res = await api.getKitchenOrders();
      setOrders(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOrders();
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  useOrdersRealtime(() => {
    fetchOrders();
  });

  const updateStatus = async (order, newStatus) => {
    try {
      await api.updateKitchenStatus(order.id, newStatus);
      fetchOrders();
    } catch (e) {
      alert("Failed to update status: " + e.response?.data?.detail || e.message);
    }
  };

  // Combine pending and accepted into "New"
  const newOrders = [...orders.pending, ...orders.accepted];
  const preparingOrders = orders.preparing;
  const readyOrders = orders.ready;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="bg-surface-container-lowest border-b border-outline-variant/30 flex justify-between items-center px-lg py-sm z-50 shrink-0">
        <div className="flex flex-col">
          <h1 className="font-headline-md text-headline-md text-primary-fixed-dim leading-none">Picklerage</h1>
          <span className="font-label-sm text-on-surface-variant uppercase tracking-widest text-[10px] mt-1">Kitchen Dashboard</span>
        </div>
        <div className="font-mono text-headline-md text-on-surface font-bold tracking-tighter">
          {currentTime}
        </div>
        <div className="flex items-center gap-md">
          <div className="flex items-center gap-xs">
            <span className="flex items-center bg-blue-500/10 text-blue-400 px-md py-1 rounded-full font-label-md">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              {newOrders.length} New
            </span>
            <span className="flex items-center bg-amber-500/10 text-amber-400 px-md py-1 rounded-full font-label-md">
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
              {preparingOrders.length} Preparing
            </span>
            <span className="flex items-center bg-emerald-500/10 text-emerald-400 px-md py-1 rounded-full font-label-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
              {readyOrders.length} Ready
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-gutter">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter h-full">
          
          {/* New Orders */}
          <div className="flex flex-col h-full rounded-xl bg-surface-container/30 border border-blue-500/20">
            <div className="p-md flex items-center justify-between border-b border-blue-500/10">
              <h2 className="font-headline-md text-blue-400 flex items-center gap-2">
                <span className="material-symbols-outlined">pending_actions</span> New Orders
              </h2>
              <span className="bg-blue-500/20 text-blue-300 px-3 py-0.5 rounded-full text-sm font-bold">{newOrders.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-md space-y-md hide-scrollbar">
              {newOrders.map(o => (
                <OrderCard 
                  key={o.id} 
                  order={o} 
                  actionLabel="Start Preparing" 
                  actionColor="bg-blue-600 hover:bg-blue-500" 
                  onAction={(order) => {
                    if (order.status === 'pending') {
                      api.updateKitchenStatus(order.id, 'accepted').then(() => updateStatus(order, 'preparing'))
                    } else {
                      updateStatus(order, 'preparing')
                    }
                  }} 
                />
              ))}
            </div>
          </div>

          {/* Preparing */}
          <div className="flex flex-col h-full rounded-xl bg-surface-container/30 border border-amber-500/20">
            <div className="p-md flex items-center justify-between border-b border-amber-500/10">
              <h2 className="font-headline-md text-amber-400 flex items-center gap-2">
                <span className="material-symbols-outlined">restaurant</span> Preparing
              </h2>
              <span className="bg-amber-500/20 text-amber-300 px-3 py-0.5 rounded-full text-sm font-bold">{preparingOrders.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-md space-y-md hide-scrollbar">
              {preparingOrders.map(o => (
                <OrderCard 
                  key={o.id} 
                  order={o} 
                  actionLabel="Mark Ready" 
                  actionColor="bg-amber-600 hover:bg-amber-500" 
                  onAction={(order) => updateStatus(order, 'ready')} 
                />
              ))}
            </div>
          </div>

          {/* Ready */}
          <div className="flex flex-col h-full rounded-xl bg-surface-container/30 border border-emerald-500/20">
            <div className="p-md flex items-center justify-between border-b border-emerald-500/10">
              <h2 className="font-headline-md text-emerald-400 flex items-center gap-2">
                <span className="material-symbols-outlined">check_circle</span> Ready
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 px-3 py-0.5 rounded-full text-sm font-bold">{readyOrders.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-md space-y-md hide-scrollbar">
              {readyOrders.map(o => (
                <OrderCard key={o.id} order={o} />
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}