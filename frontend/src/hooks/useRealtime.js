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
