import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const getMenu = () => api.get('/api/menu/');
export const verifyTable = (token) => api.get(`/api/tables/verify?token=${token}`);
export const verifyTableByNumber = (tableNumber) => api.get(`/api/tables/verify/number/${tableNumber}`);

export const createSession = (data) => api.post('/api/sessions/', data);
export const getSessionStatus = (sessionId) => api.get(`/api/sessions/${sessionId}/status`);

export const placeOrder = (data) => api.post('/api/orders/', data);
export const getOrderStatus = (orderId) => api.get(`/api/orders/${orderId}/status`);
export const getSessionOrders = (sessionId) => api.get(`/api/orders/session/${sessionId}`);
export const callWaiter = (data) => api.post('/api/waiter/', data);

export const getKitchenOrders = () => api.get('/api/kitchen/orders');
export const updateKitchenStatus = (orderId, status) => api.patch(`/api/kitchen/${orderId}/status`, { status });

export const getBillingOrders = () => api.get('/api/billing/orders');
export const getBillingStats = () => api.get('/api/billing/stats');
export const getBillingTables = () => api.get('/api/billing/tables');
export const confirmPayment = (orderId, data) => api.post(`/api/billing/${orderId}/payment`, data);
export const completeOrder = (orderId) => api.patch(`/api/billing/${orderId}/complete`);
export const updateBillingStatus = (orderId, status) => api.patch(`/api/billing/orders/${orderId}/status`, { status });

export const getWaiterCalls = () => api.get('/api/waiter/calls');
export const acknowledgeWaiterCall = (callId) => api.patch(`/api/waiter/calls/${callId}/acknowledge`);
