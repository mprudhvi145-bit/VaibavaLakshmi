import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { 
  Menu, X, Search, ShoppingBag, Heart, User, 
  ChevronDown, ChevronRight, Phone, Instagram, Facebook, Twitter,
  Store, Compass, LayoutGrid, Home
} from 'lucide-react';
import { CATEGORY_HIERARCHY, BRAND_ASSETS } from '../../constants';
import SearchOverlay from '../Search/SearchOverlay';

const StoreLayout: React.FC = () => {
  const { cart, wishlist, user } = useStore();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setMobileExpanded(null);
  }, [location]);

  const toggleMobileCategory = (id: string) => {
    setMobileExpanded(prev => prev === id ? null : id);
  };

  const cartCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

  // Check for active route for styling
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col min-h-screen bg-brand-ivory font-sans text-slate-800">
      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Top Bar (Desktop) */}
      <div className="bg-brand-primary text-white text-xs py-2 hidden md:block relative z-[60]">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <p>Free Shipping on orders over ₹10,000 | Worldwide Delivery Available</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-brand-gold">Track Order</a>
            <a href="#" className="hover:text-brand-gold">Help & Support</a>
          </div>
        </div>
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-[50] bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          
          {/* Mobile Menu Button - Left */}
          <button 
            className="md:hidden p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open Menu"
          >
            <Menu size={24} strokeWidth={2} />
          </button>

          {/* Logo - Center Mobile / Left Desktop */}
          <Link to="/" className="flex-shrink-0 group mx-auto md:mx-0" aria-label="Home">
             <div className="h-8 md:h-10 w-32 md:w-40" dangerouslySetInnerHTML={{ __html: BRAND_ASSETS.logo_svg }} />
          </Link>

          {/* Desktop Nav - Center */}
          <nav className="hidden md:flex items-center gap-8 ml-12">
            {CATEGORY_HIERARCHY.map(cat => (
              <div key={cat.id} className="relative group h-20 flex items-center">
                <Link 
                  to={`/catalog?cat=${cat.slug}`} 
                  className={`text-sm font-bold uppercase tracking-widest hover:text-brand-primary py-2 border-b-2 border-transparent hover:border-brand-primary transition-all ${cat.highlight ? 'text-brand-gold' : 'text-slate-700'}`}
                >
                  {cat.label}
                </Link>
                
                {/* Mega Menu Dropdown */}
                {cat.children && cat.children.length > 0 && (
                  <div className="absolute top-full left-0 w-64 bg-white shadow-xl border-t-2 border-brand-primary opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                    <div className="p-6 grid gap-4">
                      {cat.children.map(sub => (
                        <div key={sub.id}>
                          <Link 
                            to={`/catalog?cat=${sub.slug}`}
                            className="block font-serif font-bold text-slate-800 mb-2 hover:text-brand-primary"
                          >
                            {sub.label}
                          </Link>
                          {sub.children && (
                            <div className="pl-2 border-l border-slate-200 space-y-1">
                              {sub.children.map(child => (
                                <Link 
                                  key={child.id}
                                  to={`/catalog?cat=${child.slug}`}
                                  className="block text-xs text-slate-500 hover:text-brand-primary py-1"
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1 md:gap-4">
            <button onClick={() => setIsSearchOpen(true)} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-700" aria-label="Search">
              <Search size={22} strokeWidth={2} />
            </button>
            
            <Link to={user ? "/account/orders" : "/login"} className="hidden md:block p-2 hover:bg-slate-50 rounded-full transition-colors relative group text-slate-700">
              <User size={22} strokeWidth={2} />
              {user && <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border border-white"></span>}
            </Link>

            <Link to="/wishlist" className="hidden md:block p-2 hover:bg-slate-50 rounded-full transition-colors relative text-slate-700">
              <Heart size={22} strokeWidth={2} />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-brand-primary text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="p-2 hover:bg-slate-50 rounded-full transition-colors relative text-slate-700" aria-label="Cart">
              <ShoppingBag size={22} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-brand-primary text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu Sidebar Overlay */}
      <div className={`fixed inset-0 z-[100] bg-black/50 transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsMenuOpen(false)}>
        <div 
          className={`absolute top-0 left-0 w-4/5 max-w-sm h-full bg-white shadow-2xl transform transition-transform duration-300 flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-4 border-b flex justify-between items-center bg-slate-50 sticky top-0 z-10">
             <span className="font-serif font-bold text-lg text-brand-primary">Menu</span>
             <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-500 hover:text-slate-800"><X size={24}/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-24">
               {/* Categories */}
               {CATEGORY_HIERARCHY.map((cat) => (
                 <div key={cat.id} className="border-b border-brand-gold/10">
                   <button 
                    onClick={() => toggleMobileCategory(cat.id)}
                    className="w-full flex justify-between items-center py-4 text-lg font-serif text-brand-primary hover:text-brand-secondary"
                   >
                     {cat.label}
                     <ChevronDown size={16} className={`transform transition-transform duration-300 ${mobileExpanded === cat.id ? 'rotate-180' : ''}`} />
                   </button>
                   
                   {/* Submenu */}
                   <div className={`overflow-hidden transition-all duration-300 ease-in-out ${mobileExpanded === cat.id ? 'max-h-[1000px] opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                      <div className="pl-4 space-y-4">
                        {cat.children && cat.children.map((sub) => (
                          <div key={sub.id}>
                             <Link 
                               to={`/catalog?cat=${sub.slug}`} 
                               onClick={() => setIsMenuOpen(false)}
                               className="block font-bold text-sm text-slate-800 mb-2 uppercase tracking-wide flex items-center justify-between"
                             >
                               {sub.label}
                               <ChevronRight size={14} className="text-slate-400"/>
                             </Link>
                             
                             {sub.children && sub.children.length > 0 && (
                               <div className="pl-4 border-l-2 border-brand-gold/20 space-y-2 mb-3">
                                 {sub.children.map((child) => (
                                   <Link 
                                     key={child.id}
                                     to={`/catalog?cat=${child.slug}`}
                                     onClick={() => setIsMenuOpen(false)}
                                     className="block text-sm text-slate-600 py-1 hover:text-brand-primary"
                                   >
                                     {child.label}
                                   </Link>
                                 ))}
                               </div>
                             )}
                          </div>
                        ))}
                      </div>
                   </div>
                 </div>
               ))}
               
               <div className="pt-6 space-y-3">
                 <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="block w-full py-3 border-b border-slate-100 text-slate-700 font-bold flex items-center gap-2 hover:text-brand-primary">
                    <Heart size={18} /> My Wishlist
                 </Link>
                 <Link to={user ? "/account/orders" : "/login"} onClick={() => setIsMenuOpen(false)} className="block w-full py-3 border-b border-slate-100 text-slate-700 font-bold flex items-center gap-2 hover:text-brand-primary">
                    <User size={18} /> {user ? 'My Account' : 'Login / Sign Up'}
                 </Link>
               </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Added padding bottom for mobile nav */}
      <main className="flex-grow pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation (Fixed) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-[90] pb-safe h-16 px-2">
        <div className="grid grid-cols-5 h-full items-center">
          
          {/* 1. Stores (Home) */}
          <Link to="/" className={`flex flex-col items-center justify-center space-y-1 ${isActive('/') ? 'text-brand-primary' : 'text-slate-400'}`}>
            <Store size={20} strokeWidth={isActive('/') ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-wide">Stores</span>
          </Link>

          {/* 2. Explore (Catalog) */}
          <Link to="/catalog" className={`flex flex-col items-center justify-center space-y-1 ${location.pathname.includes('/catalog') ? 'text-brand-primary' : 'text-slate-400'}`}>
            <Compass size={20} strokeWidth={location.pathname.includes('/catalog') ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-wide">Explore</span>
          </Link>

          {/* 3. Brand Center Button */}
          <div className="flex justify-center relative">
             <Link to="/" className="absolute -top-6 bg-brand-primary text-white p-3 rounded-full shadow-lg shadow-brand-primary/30 border-4 border-white active:scale-95 transition-transform">
                <Home size={24} fill="currentColor" className="text-white" />
             </Link>
          </div>

          {/* 4. Categories (Opens Menu) */}
          <button 
            onClick={() => setIsMenuOpen(true)} 
            className={`flex flex-col items-center justify-center space-y-1 ${isMenuOpen ? 'text-brand-primary' : 'text-slate-400'}`}
          >
            <LayoutGrid size={20} strokeWidth={isMenuOpen ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-wide">Categories</span>
          </button>

          {/* 5. Account */}
          <Link 
            to={user ? "/account/orders" : "/login"} 
            className={`flex flex-col items-center justify-center space-y-1 ${location.pathname.includes('/account') || location.pathname === '/login' ? 'text-brand-primary' : 'text-slate-400'}`}
          >
            <User size={20} strokeWidth={(location.pathname.includes('/account') || location.pathname === '/login') ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-wide">Account</span>
          </Link>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-brand-secondary text-brand-ivory pt-16 pb-24 md:pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="h-10 mb-6" dangerouslySetInnerHTML={{ __html: BRAND_ASSETS.logo_svg.replace(/fill="#BE123C"/g, 'fill="#fff"').replace(/fill="#881337"/g, 'fill="#fff"') }} />
              <p className="text-sm opacity-80 leading-relaxed mb-6">
                Celebrating the timeless elegance of Indian handlooms. We bring you the finest Kanchipuram silks, Banarasi weaves, and designer ensembles directly from the weavers to your wardrobe.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-gold hover:text-brand-secondary transition-colors" aria-label="Instagram"><Instagram size={18}/></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-gold hover:text-brand-secondary transition-colors" aria-label="Facebook"><Facebook size={18}/></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-gold hover:text-brand-secondary transition-colors" aria-label="Twitter"><Twitter size={18}/></a>
              </div>
            </div>

            <div>
              <h4 className="font-serif text-xl mb-6 text-brand-gold">Shop</h4>
              <ul className="space-y-3 text-sm opacity-80">
                <li><Link to="/catalog?cat=women-sarees" className="hover:text-brand-gold transition-colors">Sarees</Link></li>
                <li><Link to="/catalog?cat=lehengas" className="hover:text-brand-gold transition-colors">Lehengas</Link></li>
                <li><Link to="/catalog?cat=sherwanis" className="hover:text-brand-gold transition-colors">Sherwanis</Link></li>
                <li><Link to="/catalog?cat=wedding-edit" className="hover:text-brand-gold transition-colors">Wedding Edit</Link></li>
                <li><Link to="/catalog" className="hover:text-brand-gold transition-colors">New Arrivals</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-xl mb-6 text-brand-gold">Support</h4>
              <ul className="space-y-3 text-sm opacity-80">
                <li><a href="#" className="hover:text-brand-gold transition-colors">Track Order</a></li>
                <li><a href="#" className="hover:text-brand-gold transition-colors">Shipping Policy</a></li>
                <li><a href="#" className="hover:text-brand-gold transition-colors">Returns & Exchange</a></li>
                <li><a href="#" className="hover:text-brand-gold transition-colors">Size Guide</a></li>
                <li><Link to="/admin" className="hover:text-brand-gold transition-colors">Operator Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-xl mb-6 text-brand-gold">Contact Us</h4>
              <ul className="space-y-4 text-sm opacity-80">
                <li className="flex items-start gap-3">
                  <Phone size={18} className="mt-0.5 text-brand-gold" />
                  <div>
                    <p className="font-bold">Customer Care</p>
                    <p>{BRAND_ASSETS.phone}</p>
                    <p>Mon-Sat, 10am - 7pm</p>
                  </div>
                </li>
                <li>
                  <p className="font-bold mb-1">Store Address</p>
                  <p>{BRAND_ASSETS.address}</p>
                </li>
                <li>
                  <p className="font-bold mb-1">Email</p>
                  <p>{BRAND_ASSETS.email}</p>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs opacity-60">
            <p>&copy; {new Date().getFullYear()} Vaibava Lakshmi. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StoreLayout;