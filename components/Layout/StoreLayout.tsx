import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, Phone, MapPin, User, AlertCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BRAND_ASSETS } from '../../constants';

const StoreLayout: React.FC = () => {
  const { cart, isDemoMode } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <div className="min-h-screen flex flex-col bg-brand-light">
      {/* Demo Banner */}
      {isDemoMode && (
        <div className="bg-brand-accent text-white text-xs py-2 px-4 text-center font-bold border-b border-brand-accent flex items-center justify-center">
            <AlertCircle size={14} className="mr-2" />
            Backend Disconnected: Running in Demo Mode with Local Data
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-brand-dark text-white text-xs py-2 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex space-x-4">
            <span className="flex items-center"><Phone size={14} className="mr-1"/> {BRAND_ASSETS.phone}</span>
            <span className="flex items-center"><MapPin size={14} className="mr-1"/> {BRAND_ASSETS.address.split(',')[0]}</span>
          </div>
          <div className="hidden sm:block">Welcome to {BRAND_ASSETS.name}</div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-brand-light">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-brand-text"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="h-10 w-48" dangerouslySetInnerHTML={{ __html: BRAND_ASSETS.logo_svg }} />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className={`font-medium hover:text-brand-primary ${location.pathname === '/' ? 'text-brand-primary' : 'text-slate-600'}`}>Home</Link>
              <Link to="/catalog" className={`font-medium hover:text-brand-primary ${location.pathname === '/catalog' ? 'text-brand-primary' : 'text-slate-600'}`}>All Products</Link>
              <Link to="/catalog?cat=Sarees" className="font-medium hover:text-brand-primary text-slate-600">Sarees</Link>
              <Link to="/admin" className="font-medium text-slate-400 hover:text-brand-primary">Admin Panel</Link>
            </nav>

            {/* Icons */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-brand-text hover:text-brand-primary">
                <Search size={20} />
              </button>
              <Link to="/cart" className="p-2 text-brand-text hover:text-brand-primary relative">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-brand-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button className="hidden sm:block p-2 text-brand-text hover:text-brand-primary">
                <User size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 space-y-3">
             <Link to="/" className="block font-medium text-brand-text" onClick={() => setIsMenuOpen(false)}>Home</Link>
             <Link to="/catalog" className="block font-medium text-brand-text" onClick={() => setIsMenuOpen(false)}>All Products</Link>
             <Link to="/catalog?cat=Sarees" className="block font-medium text-brand-text" onClick={() => setIsMenuOpen(false)}>Sarees</Link>
             <Link to="/admin" className="block font-medium text-slate-400" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-brand-dark text-rose-100 py-12 border-t-4 border-brand-accent">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
             <h3 className="text-white text-lg font-bold mb-4 font-serif">Vaibava Lakshmi</h3>
             <p className="text-sm leading-relaxed mb-4 opacity-90">
               Your one-stop destination for premium silks, designer wear, and family fashion. Tradition meets trend at the heart of Warangal.
             </p>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4 font-serif">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/catalog" className="hover:text-brand-gold transition-colors">New Arrivals</Link></li>
              <li><Link to="/catalog" className="hover:text-brand-gold transition-colors">Best Sellers</Link></li>
              <li><a href="#" className="hover:text-brand-gold transition-colors">Track Order</a></li>
              <li><a href="#" className="hover:text-brand-gold transition-colors">Shipping Policy</a></li>
            </ul>
          </div>
          <div>
             <h3 className="text-white text-lg font-bold mb-4 font-serif">Visit Us</h3>
             <p className="text-sm mb-2">{BRAND_ASSETS.address}</p>
             <p className="text-sm mb-4">Email: {BRAND_ASSETS.email}</p>
             <div className="flex space-x-3">
               <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center hover:bg-brand-accent cursor-pointer transition-colors">F</div>
               <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center hover:bg-brand-accent cursor-pointer transition-colors">I</div>
               <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center hover:bg-brand-accent cursor-pointer transition-colors">W</div>
             </div>
          </div>
        </div>
        <div className="border-t border-rose-900 mt-8 pt-8 text-center text-xs opacity-75">
          © 2023 {BRAND_ASSETS.name}. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default StoreLayout;