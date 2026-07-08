import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../services/api';
import WelcomeScreen from './WelcomeScreen';
import CustomerMenu from './CustomerMenu';

export default function TableFlow() {
  const { tableId } = useParams();
  
  const [tableInfo, setTableInfo] = useState(null);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no tableId (e.g. just / ) we might treat it as takeout or fail.
    // For now, let's treat it as table navigation.
    let tableNum = parseInt(tableId, 10);
    
    if (isNaN(tableNum) || tableNum === 0) {
      // Default to Table 1 for testing purposes if no tableId is provided in URL
      tableNum = 1;
    }

    api.verifyTableByNumber(tableNum)
      .then(res => {
        setTableInfo({ orderType: 'dine_in', table_id: res.data.table_id, table_number: res.data.table_number });
        if (res.data.active_session) {
          setSession(res.data.active_session);
        }
      })
      .catch(err => {
        console.error("Table verification failed", err);
        setError("Invalid table number");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [tableId]);

  const handleWelcomeSubmit = async (details) => {
    try {
      const res = await api.createSession({
        table_id: tableInfo.table_id,
        ...details
      });
      setSession(res.data);
    } catch (err) {
      console.error("Failed to create session", err);
      alert("Failed to start session. Please try again.");
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen bg-background flex items-center justify-center font-headline-md">{error}</div>;

  // If dine-in and no session created yet, show welcome screen
  if (tableInfo.orderType === 'dine_in' && !session) {
    return <WelcomeScreen onSubmit={handleWelcomeSubmit} />;
  }

  // Session created or takeout, show menu
  return <CustomerMenu tableInfo={tableInfo} session={session} />;
}
