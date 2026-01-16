import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, User, Heart, Home, Grid, ChevronDown, ChevronRight, LogIn } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BRAND_ASSETS, CATEGORY_HIERARCHY } from '../../constants';
import SearchOverlay from '../Search/SearchOverlay';

const StoreLayout: React.FC = () => {
  const { cart, wishlist, user } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const location = useLocation();

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const wishlistCount = wishlist.length;

  // Mobile Menu Accordion Toggle
  const toggleMobileCategory = (id: string) => {
    setMobileExpanded(mobileExpanded === id ? null : id);
  };

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Close menu on route change (navigation)
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-brand-ivory text-brand-text font-sans relative">
      
      {/* Search Overlay Component */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Announcement Bar */}
      <div className="bg-brand-primary text-brand-gold text-[10px] md:text-xs py-2 text-center tracking-widest uppercase font-medium z-50 relative">
        Free Shipping on all domestic orders above ₹10,000 | Worldwide Shipping Available
      </div>

      {/* Luxury Header */}
      <header className="sticky top-0 z-40 bg-brand-ivory/95 backdrop-blur-md border-b border-brand-gold/20 transition-all duration-300">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Desktop Left Nav - Mega Menu Trigger */}
            <nav className="hidden lg:flex space-x-8 items-center h-full">
              {CATEGORY_HIERARCHY.map((category) => (
                <div 
                  key={category.id}
                  className="h-full flex items-center group cursor-pointer"
                  onMouseEnter={() => setActiveMegaMenu(category.id)}
                  onMouseLeave={() => setActiveMegaMenu(null)}
                >
                  <Link 
                    to={`/catalog?cat=${category.slug}`}
                    className={`text-sm font-medium tracking-wide transition-colors uppercase border-b-2 border-transparent py-7 ${category.highlight ? 'text-brand-gold font-bold' : 'text-slate-800 hover:text-brand-primary hover:border-brand-primary'}`}
                  >
                    {category.label}
                  </Link>
                  
                  {/* Mega Menu Dropdown */}
                  <div className={`absolute top-20 left-0 w-full bg-white shadow-xl border-t border-brand-gold/20 transition-all duration-300 transform origin-top z-50 ${activeMegaMenu === category.id ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-0 invisible'}`}>
                    <div className="container mx-auto px-12 py-8 grid grid-cols-4 gap-8">
                      {category.children && category.children.length > 0 ? (
                        category.children.map((sub) => (
                          <div key={sub.id} className="space-y-4">
                             <Link to={`/catalog?cat=${sub.slug}`} className="block font-serif text-brand-primary text-lg font-bold hover:text-brand-gold border-b border-slate-100 pb-2">
                               {sub.label}
                             </Link>
                             <ul className="space-y-2">
                               {sub.children && sub.children.length > 0 ? (
                                 sub.children.map((child) => (
                                   <li key={child.id}>
                                     <Link to={`/catalog?cat=${child.slug}`} className="text-sm text-slate-600 hover:text-brand-primary hover:translate-x-1 transition-transform inline-block">
                                       {child.label}
                                     </Link>
                                   </li>
                                 ))
                               ) : (
                                 <li>
                                   <Link to={`/catalog?cat=${sub.slug}`} className="text-sm text-slate-500 italic">View Collection</Link>
                                 </li>
                               )}
                             </ul>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-3 text-slate-500 italic">Explore our {category.label} collection.</div>
                      )}

                      {/* Promo Image in Mega Menu */}
                      <div className="col-span-1 bg-brand-gray aspect-[3/4] rounded-lg overflow-hidden relative group">
                          <img 
                            src={`https://source.unsplash.com/random/400x600/?${category.label} fashion`} 
                            alt={category.label} 
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" 
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <span className="text-white font-serif text-xl border-b border-white pb-1 tracking-widest uppercase">New In</span>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </nav>

            {/* Mobile Menu Toggle */}
            <button className="lg:hidden text-brand-text p-2 -ml-2" onClick={() => setIsMenuOpen(true)} aria-label="Open Menu">
              <Menu size={24} />
            </button>

            {/* Centered Logo */}
            <Link to="/" className="text-2xl md:text-3xl font-serif font-bold text-brand-primary tracking-tight">
              Vaibava<span className="text-brand-gold italic">Lakshmi</span>
            </Link>

            {/* Right Icons */}
            <div className="flex items-center space-x-4 md:space-x-6">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="hover:text-brand-primary transition-colors p-1"
                aria-label="Search"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>
              
              <Link to="/wishlist" className="hidden md:block hover:text-brand-primary transition-colors relative">
                  <Heart size={20} strokeWidth={1.5} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full">
                        {wishlistCount}
                    </span>
                  )}
              </Link>
              
              <Link to="/cart" className="relative hover:text-brand-primary transition-colors">
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              {user ? (
                  <Link to="/account/orders" className="hidden md:flex items-center gap-2 hover:text-brand-primary transition-colors text-sm font-medium">
                      <User size={20} strokeWidth={1.5} />
                      {user.name}
                  </Link>
              ) : (
                  <Link to="/login" className="hidden md:block hover:text-brand-primary transition-colors">
                      <User size={20} strokeWidth={1.5} />
                  </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-brand-text text-brand-ivory py-16 border-t-4 border-brand-gold">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
             <h3 className="text-2xl font-serif text-brand-gold mb-6">Vaibava Lakshmi</h3>
             <p className="text-sm opacity-70 leading-relaxed font-light">
               Curating the finest Kanchipuram silks and ethnic ensembles since 1995. A legacy of tradition woven with modern elegance.
             </p>
          </div>
          
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-brand-gold mb-6">Collections</h4>
            <ul className="space-y-3 text-sm font-light opacity-80">
              <li><Link to="/catalog?cat=kanchipuram-silk" className="hover:text-brand-gold transition-colors">Bridal Kanjivaram</Link></li>
              <li><Link to="/catalog?cat=banarasi" className="hover:text-brand-gold transition-colors">Banarasi Georgette</Link></li>
              <li><Link to="/catalog?cat=lehengas" className="hover:text-brand-gold transition-colors">Designer Lehengas</Link></li>
              <li><Link to="/catalog?cat=sherwanis" className="hover:text-brand-gold transition-colors">Royal Sherwanis</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-brand-gold mb-6">Customer Care</h4>
            <ul className="space-y-3 text-sm font-light opacity-80">
              <li><a href="#" className="hover:text-brand-gold transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-brand-gold transition-colors">Returns & Exchange</a></li>
              <li><a href="#" className="hover:text-brand-gold transition-colors">Size Guide</a></li>
              <li><a href="#" className="hover:text-brand-gold transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
             <h4 className="text-sm font-bold uppercase tracking-widest text-brand-gold mb-6">Connect</h4>
             <p className="text-sm opacity-70 mb-2">{BRAND_ASSETS.address}</p>
             <p className="text-sm opacity-70 mb-4">{BRAND_ASSETS.phone}</p>
          </div>
        </div>
        <div className="text-center text-[10px] uppercase tracking-widest opacity-40 mt-16">
          © 2023 Vaibava Lakshmi Shopping Mall. All Rights Reserved.
        </div>
      </footer>

      {/* Floating Overlay Menu (Mobile) - Moved to root level for better z-index management */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
             onClick={() => setIsMenuOpen(false)}
           ></div>
           
           {/* Menu Panel */}
           <div className="relative w-[85%] max-w-sm h-full bg-brand-ivory overflow-y-auto shadow-2xl animate-slide-right flex flex-col" onClick={(e) => e.stopPropagation()}>
             
             {/* Menu Header */}
             <div className="flex justify-between items-center p-4 border-b border-brand-gold/20 sticky top-0 bg-brand-ivory z-10">
               <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-xl font-serif font-bold text-brand-primary">
                  Vaibava<span className="text-brand-gold italic">Lakshmi</span>
               </Link>
               <button onClick={() => setIsMenuOpen(false)} className="text-slate-500 p-2">
                 <X size={24} />
               </button>
             </div>

             <div className="p-4 space-y-2 flex-grow">
               {/* Explicit Home Link for Navigation */}
               <div className="border-b border-brand-gold/10">
                  <Link 
                    to="/" 
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center gap-2 py-4 text-lg font-serif text-brand-primary"
                  >
                    <Home size={18} /> Home
                  </Link>
               </div>

               {CATEGORY_HIERARCHY.map((cat) => (
                 <div key={cat.id} className="border-b border-brand-gold/10">
                   <button 
                    onClick={() => toggleMobileCategory(cat.id)}
                    className="w-full flex justify-between items-center py-4 text-lg font-serif text-brand-primary"
                   >
                     {cat.label}
                     <ChevronDown size={16} className={`transform transition-transform ${mobileExpanded === cat.id ? 'rotate-180' : ''}`} />
                   </button>
                   
                   {/* Level 2 & 3 Mobile */}
                   <div className={`overflow-hidden transition-all duration-300 ${mobileExpanded === cat.id ? 'max-h-[1000px] opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
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
                 <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="block w-full py-3 border-b border-slate-100 text-slate-700 font-bold flex items-center gap-2">
                    <Heart size={18} /> My Wishlist
                 </Link>
                 <Link to={user ? "/account/orders" : "/login"} onClick={() => setIsMenuOpen(false)} className="block w-full py-3 border-b border-slate-100 text-slate-700 font-bold flex items-center gap-2">
                    <User size={18} /> {user ? 'My Account' : 'Login / Sign Up'}
                 </Link>
               </div>
             </div>
           </div>
        </div>
      )}

      {/* Mobile Bottom Navigation (Sticky) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-brand-ivory border-t border-brand-gold/20 shadow-[0_-5px_10px_rgba(0,0,0,0.05)] z-50 flex justify-around py-3 pb-safe">
        <Link to="/" className={`flex flex-col items-center space-y-1 ${location.pathname === '/' ? 'text-brand-primary' : 'text-slate-400'}`}>
          <Home size={20} strokeWidth={1.5} />
          <span className="text-[10px] uppercase tracking-wide">Home</span>
        </Link>
        <Link to="/catalog" className={`flex flex-col items-center space-y-1 ${location.pathname.includes('/catalog') ? 'text-brand-primary' : 'text-slate-400'}`}>
          <Grid size={20} strokeWidth={1.5} />
          <span className="text-[10px] uppercase tracking-wide">Shop</span>
        </Link>
        <Link to="/cart" className={`flex flex-col items-center space-y-1 ${location.pathname === '/cart' ? 'text-brand-primary' : 'text-slate-400'} relative`}>
          <ShoppingBag size={20} strokeWidth={1.5} />
          {cartCount > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 bg-brand-primary rounded-full animate-bounce"></span>
          )}
          <span className="text-[10px] uppercase tracking-wide">Bag</span>
        </Link>
        <Link to={user ? "/account/orders" : "/login"} className={`flex flex-col items-center space-y-1 ${location.pathname.includes('/account') || location.pathname === '/login' ? 'text-brand-primary' : 'text-slate-400'}`}>
          <User size={20} strokeWidth={1.5} />
          <span className="text-[10px] uppercase tracking-wide">Account</span>
        </Link>
      </div>

    </div>
  );
};

export default StoreLayout;