import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';

// Layouts
import StoreLayout from './components/Layout/StoreLayout';
import AdminLayout from './components/Layout/AdminLayout';

// Store Pages
import Home from './pages/store/Home';
import Catalog from './pages/store/Catalog';
import ProductDetail from './pages/store/ProductDetail';
import Cart from './pages/store/Cart';
import SearchResults from './pages/store/SearchResults';
import Checkout from './pages/store/Checkout';
import OrderConfirmation from './pages/store/OrderConfirmation';

// Admin Pages
import Login from './pages/admin/Login'; 
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import OrderDetail from './pages/admin/OrderDetail';
import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import SearchHealth from './pages/admin/SearchHealth';
import Shipping from './pages/admin/Shipping';
import Notifications from './pages/admin/Notifications';
import Analytics from './pages/admin/Analytics'; // New
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
            
            {/* Catalog Routes: General and Category-Specific */}
            <Route path="catalog" element={<Catalog />} />
            <Route path="catalog/:category" element={<Catalog />} />
            
            <Route path="search" element={<SearchResults />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
          </Route>

          {/* Checkout Flow (No Layout) */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmed" element={<OrderConfirmation />} />

          {/* Admin Login */}
          <Route path="/admin/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="search-health" element={<SearchHealth />} />
            <Route path="analytics" element={<Analytics />} /> {/* New Route */}
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