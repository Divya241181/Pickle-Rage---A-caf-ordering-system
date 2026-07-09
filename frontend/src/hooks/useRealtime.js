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
