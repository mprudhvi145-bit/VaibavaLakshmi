import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';

// Layouts
import StoreLayout from './components/Layout/StoreLayout';
import AdminLayout from './components/Layout/AdminLayout';

// Store Pages
import Home from './pages/store/Home';
import Catalog from './pages/store/Catalog';
import Cart from './pages/store/Cart';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import Products from './pages/admin/Products';
import Shipping from './pages/admin/Shipping';
import Notifications from './pages/admin/Notifications';
import SOP from './pages/admin/SOP';
import Finance from './pages/admin/Finance';

const App: React.FC = () => {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          {/* Store Routes */}
          <Route path="/" element={<StoreLayout />}>
            <Route index element={<Home />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="product/:id" element={<div className="p-8 text-center">Product Detail View (Placeholder)</div>} />
            <Route path="cart" element={<Cart />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<Products />} />
            <Route path="customers" element={<div className="p-8">Customer Management List</div>} />
            <Route path="shipping" element={<Shipping />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="sop" element={<SOP />} />
            <Route path="finance" element={<Finance />} />
            <Route path="settings" element={<div className="p-8">General Settings & Configuration</div>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </StoreProvider>
  );
};

export default App;