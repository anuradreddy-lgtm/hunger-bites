import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingContactButtons } from './components/FloatingContactButtons';
import { ToastContainer } from './components/ToastContainer';
import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { Checkout } from './pages/Checkout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminFoodManagement } from './pages/admin/AdminFoodManagement';
import { AdminOrderManagement } from './pages/admin/AdminOrderManagement';
import { AdminCustomerManagement } from './pages/admin/AdminCustomerManagement';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminPayments } from './pages/admin/AdminPayments';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Admin Portal Sign In */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Secure Admin Dashboard Panel */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="food" element={<AdminFoodManagement />} />
            <Route path="orders" element={<AdminOrderManagement />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="customers" element={<AdminCustomerManagement />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Customer Facing Web Storefront */}
          <Route
            path="/*"
            element={
              <div className="flex flex-col min-h-screen bg-light dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-200">
                <Navbar />
                <div className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/checkout" element={<Checkout />} />

                    {/* Catch all fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
                <Footer />
                <FloatingContactButtons />
              </div>
            }
          />
        </Routes>
        
        {/* Global Floating Toasts Container */}
        <ToastContainer />
      </Router>
    </AppProvider>
  );
}

export default App;
