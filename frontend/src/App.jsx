import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TableFlow from './pages/TableFlow'
import OrderTracker from './pages/OrderTracker'
import KitchenDashboard from './pages/KitchenDashboard'
import BillingDashboard from './pages/BillingDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TableFlow />} />
        <Route path="/:tableId" element={<TableFlow />} />
        <Route path="/order/:orderId" element={<OrderTracker />} />
        <Route path="/kitchen" element={<KitchenDashboard />} />
        <Route path="/billing" element={<BillingDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
