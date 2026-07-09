import { useEffect } from 'react';
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
export function useWaiterCallsRealtime(onUpdate) {
  useEffect(() => {
    const channel = supabase
      .channel('waitercalls-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'waiter_calls' },
        (payload) => onUpdate(payload)
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}
export function useTableSessionsRealtime(onUpdate) {
  useEffect(() => {
    const channel = supabase
      .channel('tablesessions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'table_sessions' },
        (payload) => onUpdate(payload)
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}

export function useSessionRealtime(sessionId, onSessionClosed) {
  useEffect(() => {
    if (!sessionId) return;
    const channel = supabase
      .channel(`session-${sessionId}`)
      .on('postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'table_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          if (payload.new.status === 'closed') {
            onSessionClosed();
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, onSessionClosed]);
}
