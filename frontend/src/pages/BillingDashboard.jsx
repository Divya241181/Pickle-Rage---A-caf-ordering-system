import React, { useState, useEffect } from "react";
import * as api from "../services/api";
import { useOrdersRealtime, useWaiterCallsRealtime } from "../hooks/useRealtime";
import { formatElapsed } from "../utils/formatters";

export default function BillingDashboard() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    active_orders: 0,
    today_sales: 0,
    completed_orders: 0,
    pending_payment: 0,
    dine_in_count: 0,
    takeout_count: 0
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [filter, setFilter] = useState('All');
  const [waiterCalls, setWaiterCalls] = useState([]);

  const fetchData = async () => {
    try {
      const [ordersRes, statsRes, callsRes] = await Promise.all([
        api.getBillingOrders(),
        api.getBillingStats(),
        api.getWaiterCalls()
      ]);
      const rawOrders = ordersRes.data;
      const groupedOrders = [];
      const sessionMap = new Map();

      rawOrders.forEach(order => {
        const itemsWithStatus = order.items.map(item => ({ ...item, status: order.status }));
        if (order.order_type === 'dine_in' && order.session_id) {
          if (sessionMap.has(order.session_id)) {
            const existing = sessionMap.get(order.session_id);
            // Append items and sum the total
            existing.items.push(...itemsWithStatus);
            existing.total += order.total;
            existing.original_orders.push(order);
          } else {
            const newGroup = { ...order, items: itemsWithStatus, original_orders: [order] };
            sessionMap.set(order.session_id, newGroup);
            groupedOrders.push(newGroup);
          }
        } else {
          const newGroup = { ...order, items: itemsWithStatus, original_orders: [order] };
          groupedOrders.push(newGroup);
        }
      });

      setOrders(groupedOrders);
      setStats(statsRes.data);
      setWaiterCalls(callsRes.data.filter(c => c.status === 'pending'));
      
      // Update selected order if it still exists
      if (selectedOrder) {
        const updated = groupedOrders.find(o => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useOrdersRealtime(() => {
    fetchData();
  });

  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // ignore
    }
  };

  useWaiterCallsRealtime((payload) => {
    if (payload.eventType === 'INSERT') {
      playNotificationSound();
      setWaiterCalls(prev => [payload.new, ...prev]);
    } else if (payload.eventType === 'UPDATE') {
      if (payload.new.status !== 'pending') {
        setWaiterCalls(prev => prev.filter(c => c.id !== payload.new.id));
      }
    }
  });

  const handlePayment = async () => {
    if (!selectedOrder) return;
    try {
      // Process payments for all original orders that make up this entry sequentially to prevent race conditions on session closing
      for (const origOrder of selectedOrder.original_orders) {
        if (origOrder.status !== 'completed' && !origOrder.payment) {
          await api.confirmPayment(origOrder.id, { method: paymentMethod, amount: origOrder.total });
        }
      }
      setSelectedOrder(null);
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Payment failed");
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'All') return o.status !== 'completed' && o.status !== 'cancelled';
    if (filter === 'Completed') return o.status === 'completed';
    if (filter === 'New') return o.status === 'pending' || o.status === 'accepted';
    if (filter === 'Preparing') return o.status === 'preparing';
    if (filter === 'Ready') return o.status === 'ready';
    return true;
  });

  const getBorderColor = (status, mins) => {
    if (status === 'completed') return 'border-outline-variant grayscale opacity-60';
    if (mins >= 20) return 'border-error';
    if (mins >= 10) return 'border-secondary-container';
    return 'border-primary';
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile TopBar (Hidden on Desktop) */}
      <div className="md:hidden fixed top-0 z-50 flex justify-between items-center w-full px-lg py-sm bg-surface/90 backdrop-blur-md shadow-sm border-b border-outline-variant">
        <div className="font-headline-md font-bold text-primary">Picklerage</div>
      </div>

      {/* Left Sidebar */}
      <aside className="hidden md:flex flex-col h-full w-[220px] bg-surface-container-low border-r border-outline-variant flex-shrink-0">
        <div className="p-lg border-b border-outline-variant">
          <h1 className="font-headline-md text-primary font-bold tracking-tight">Picklerage</h1>
          <p className="font-label-md text-on-surface-variant mt-xs">Billing Counter</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-md px-sm space-y-xs">
          <button onClick={() => setFilter('All')} className={`w-full flex items-center gap-md rounded-lg px-md py-sm transition-transform font-label-md ${filter==='All'?'bg-primary-container text-on-primary-container':'text-on-surface-variant hover:bg-surface-variant'}`}>
            <span className="material-symbols-outlined">receipt_long</span> All Active
          </button>
          <button onClick={() => setFilter('New')} className={`w-full flex items-center gap-md rounded-lg px-md py-sm transition-transform font-label-md ${filter==='New'?'bg-primary-container text-on-primary-container':'text-on-surface-variant hover:bg-surface-variant'}`}>
            <span className="material-symbols-outlined">fiber_new</span> New
          </button>
          <button onClick={() => setFilter('Preparing')} className={`w-full flex items-center gap-md rounded-lg px-md py-sm transition-transform font-label-md ${filter==='Preparing'?'bg-primary-container text-on-primary-container':'text-on-surface-variant hover:bg-surface-variant'}`}>
            <span className="material-symbols-outlined">skillet</span> Preparing
          </button>
          <button onClick={() => setFilter('Ready')} className={`w-full flex items-center justify-between rounded-lg px-md py-sm transition-transform font-label-md ${filter==='Ready'?'bg-primary-container text-on-primary-container':'text-on-surface-variant hover:bg-surface-variant'}`}>
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined">room_service</span> Ready
            </div>
          </button>
          <button onClick={() => setFilter('Completed')} className={`w-full flex items-center gap-md rounded-lg px-md py-sm transition-transform font-label-md ${filter==='Completed'?'bg-primary-container text-on-primary-container':'text-on-surface-variant hover:bg-surface-variant'}`}>
            <span className="material-symbols-outlined">check_circle</span> Completed
          </button>

          <div className="mt-lg pt-md border-t border-outline-variant px-md">
            <div className="flex justify-between items-center mb-sm">
              <p className="text-[11px] uppercase tracking-wider text-outline font-bold">Waiter Calls</p>
              {waiterCalls.length > 0 && <span className="bg-error text-on-error text-[10px] font-bold px-1.5 py-0.5 rounded-full">{waiterCalls.length}</span>}
            </div>
            <div className="space-y-sm mb-lg">
              {waiterCalls.map(call => {
                const isBill = call.reason?.toLowerCase().includes('bill');
                const isWater = call.reason?.toLowerCase().includes('water');
                const bgClass = isBill ? 'bg-error-container text-on-error-container' : isWater ? 'bg-primary-container text-on-primary-container' : 'bg-orange-100 text-orange-900';
                
                return (
                  <div key={call.id} className={`p-sm rounded-lg ${bgClass}`}>
                    <div className="flex justify-between items-start mb-xs">
                      <span className="font-bold text-xs tracking-tight">Table {call.table_number}</span>
                      <span className="text-[10px] opacity-80">{formatElapsed(call.created_at)}</span>
                    </div>
                    <p className="text-xs mb-sm font-medium">{call.reason}</p>
                    <button 
                      onClick={async () => {
                        try {
                          await api.acknowledgeWaiterCall(call.id);
                          setWaiterCalls(prev => prev.filter(c => c.id !== call.id));
                        } catch(e) { console.error(e); }
                      }}
                      className="w-full py-1 bg-surface/50 hover:bg-surface/80 rounded text-[10px] font-bold uppercase transition-colors"
                    >
                      Acknowledge
                    </button>
                  </div>
                );
              })}
              {waiterCalls.length === 0 && <p className="text-xs text-on-surface-variant italic">No pending calls</p>}
            </div>

            <p className="text-[11px] uppercase tracking-wider text-outline font-bold mb-sm">Today's Overview</p>
            <div className="space-y-sm">
              <div className="flex justify-between items-center">
                <span className="font-label-sm text-on-surface-variant">Active</span>
                <span className="font-label-md text-on-surface">{stats.active_orders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-label-sm text-on-surface-variant">Sales</span>
                <span className="font-label-md text-primary">₹{stats.today_sales}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-label-sm text-on-surface-variant">Pending</span>
                <span className="font-label-md text-secondary">{stats.pending_payment}</span>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* Center Panel */}
      <main className="flex-1 flex flex-col h-full bg-surface overflow-hidden relative pt-[60px] md:pt-0">
        <header className="p-md md:p-lg flex flex-col sm:flex-row gap-md justify-between items-start sm:items-center bg-surface z-10">
          <h2 className="font-headline-md text-on-surface hidden md:block">{filter} Orders</h2>
          <div className="flex items-center gap-md ml-auto">
            <div className="relative">
              <span className="material-symbols-outlined text-outline cursor-pointer text-3xl">notifications</span>
              {waiterCalls.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-on-error text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-surface">
                  {waiterCalls.length}
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-md md:p-lg space-y-sm hide-scrollbar">
          {filteredOrders.map(order => {
            const mins = Math.floor(order.elapsed_seconds / 60);
            const isSelected = selectedOrder?.id === order.id;
            
            return (
              <div 
                key={order.id} 
                onClick={() => setSelectedOrder(order)}
                className={`relative bg-surface-container-lowest rounded-xl border soft-shadow p-md cursor-pointer transition-transform hover:-translate-y-1 overflow-hidden ${isSelected ? 'ring-1 ring-primary/20 bg-surface-container-low' : 'border-outline-variant'} ${order.status === 'ready' ? 'border-l-4 border-l-emerald-400 bg-emerald-50/30' : ''}`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getBorderColor(order.status, mins)} ${order.status === 'ready' ? 'hidden' : ''}`}></div>
                <div className="flex justify-between items-start ml-sm">
                  <div className="flex items-center gap-md">
                    <span className="font-headline-md text-primary font-bold">
                      {order.order_type === 'dine_in' ? `Table ${order.table_number}` : `Takeout - ${order.customer_name}`}
                    </span>
                    <span className="px-2 py-0.5 bg-surface-container-high rounded text-xs font-label-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">{order.order_type === 'dine_in' ? 'restaurant' : 'takeout_dining'}</span> 
                      {order.order_type === 'dine_in' ? 'Dine-in' : 'Takeout'}
                    </span>
                  </div>
                  <span className="font-headline-md text-on-surface">₹{order.total}</span>
                </div>
                <div className="mt-md flex justify-between items-end ml-sm">
                  <div>
                    <p className="font-body-md text-on-surface font-medium">{order.customer_name}</p>
                    <p className="text-sm text-on-surface-variant mt-xs">{order.items.length} Items • {formatElapsed(order.created_at)}</p>
                  </div>
                  <div className="flex gap-sm">
                    <span className="px-3 py-1 bg-primary-fixed rounded-full text-on-primary-fixed text-xs font-bold flex items-center gap-1 uppercase">
                      {order.status === 'ready' && <span className="material-symbols-outlined text-[14px]">notifications_active</span>}
                      {order.status}
                    </span>
                    {order.payment ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">PAID</span>
                    ) : (
                      <span className="px-3 py-1 bg-secondary-fixed rounded-full text-on-secondary-fixed text-xs font-bold">UNPAID</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* Right Panel: Order Detail */}
      {selectedOrder && (
        <aside className="absolute md:relative right-0 top-0 bottom-0 flex flex-col w-full md:w-[340px] bg-surface-container-lowest border-l border-outline-variant shadow-lg z-[100] flex-shrink-0 animate-slide-up md:animate-none">
          <div className="p-lg border-b border-outline-variant bg-surface relative">
            <button onClick={() => setSelectedOrder(null)} className="md:hidden absolute top-4 right-4 p-2">
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex justify-between items-start mt-4 md:mt-0">
              <div>
                <h3 className="font-headline-md text-primary font-bold">
                  {selectedOrder.order_type === 'dine_in' ? `Table ${selectedOrder.table_number}` : `Takeout - ${selectedOrder.customer_name}`}
                </h3>
                <p className="font-body-md text-on-surface-variant mt-1">{selectedOrder.customer_name}</p>
              </div>
              <div className="text-right">
                <span className="font-headline-md text-on-surface">₹{selectedOrder.total}</span>
              </div>
            </div>
            <div className="flex gap-sm mt-md">
              <span className="px-2 py-1 bg-surface-container-high rounded text-xs font-label-sm border border-outline-variant">
                {selectedOrder.order_type === 'dine_in' ? `Dine-in • Table ${selectedOrder.table_number}` : 'Takeout'}
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-lg">
            <h4 className="font-label-md text-outline uppercase tracking-wider mb-sm">Items</h4>
            <div className="space-y-md">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start border-b border-outline-variant pb-sm">
                  <div className="flex-1">
                    <p className="font-body-md text-on-surface font-medium">{item.name}</p>
                  </div>
                  <div className="text-right flex items-center gap-md">
                    <span className="text-sm text-on-surface-variant">{item.quantity} x ₹{item.unit_price}</span>
                    <span className="font-label-md text-on-surface w-12">₹{item.quantity * item.unit_price}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-lg pt-sm border-t-2 border-outline-variant border-dashed">
              <div className="flex justify-between font-headline-md text-on-surface mt-sm">
                <span>Total</span>
                <span className="text-primary font-bold">₹{selectedOrder.total}</span>
              </div>
            </div>
          </div>
          {/* Conditional Action Section */}
          <div className="p-lg bg-surface-container-low border-t border-outline-variant">
            {selectedOrder.status === 'completed' || selectedOrder.status === 'cancelled' ? null : 
             ['pending', 'accepted', 'preparing'].includes(selectedOrder.status) ? (
              <div className="text-center text-on-surface-variant font-label-md py-4">
                Waiting for kitchen...
              </div>
            ) : selectedOrder.status === 'ready' ? (
              <button 
                onClick={async () => {
                  try {
                    for (const origOrder of selectedOrder.original_orders) {
                      if (origOrder.status === 'ready') {
                        await api.updateBillingStatus(origOrder.id, 'served');
                      }
                    }
                    setSelectedOrder(null);
                    fetchData();
                  } catch (e) {
                    console.error(e);
                    alert("Failed to mark as served");
                  }
                }}
                className="w-full py-3 bg-emerald-600 text-white rounded-full font-label-md font-bold shadow-sm hover:scale-98 transition-transform flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">room_service</span>
                Mark Served
              </button>
            ) : selectedOrder.status === 'served' && !selectedOrder.payment ? (
              <>
                <h4 className="font-label-md text-on-surface mb-sm">Payment Method</h4>
                <div className="grid grid-cols-2 gap-2 mb-md">
                  {['UPI', 'Cash', 'Card', 'Other'].map(method => (
                    <button 
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-2 border rounded-lg font-label-md flex items-center justify-center gap-1 transition-colors ${paymentMethod === method ? 'border-primary bg-primary-fixed-dim/20 text-primary' : 'border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-variant'}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
                <button onClick={handlePayment} className="w-full py-3 bg-primary text-on-primary rounded-full font-label-md font-bold shadow-sm hover:scale-98 transition-transform flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  Confirm Payment
                </button>
              </>
            ) : null}
          </div>
        </aside>
      )}
    </div>
  );
}