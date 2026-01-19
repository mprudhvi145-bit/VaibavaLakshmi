import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Package, ChevronRight, LogOut, ShoppingBag, Gift, 
  User, MapPin, CreditCard, HelpCircle, Wallet, Star,
  RefreshCw, ShieldCheck, CheckCircle, ChevronDown
} from 'lucide-react';

const OrderHistory: React.FC = () => {
  const { user, fetchCustomerOrders, logout, isLoading, products, wishlist } = useStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [period, setPeriod] = useState('Last 6 months');

  useEffect(() => {
    if (!user) {
        navigate('/login');
        return;
    }
    const load = async () => {
        const data = await fetchCustomerOrders();
        setOrders(data);
        setPageLoading(false);
    };
    load();
  }, [user]);

  const handleLogout = () => {
      logout();
      navigate('/');
  };

  // --- DERIVED DATA FOR EMPTY STATE ---
  // Get products from wishlist, or fallback to first 4 products for recommendation
  const suggestionItems = wishlist.length > 0 
    ? products.filter(p => wishlist.includes(p.id)).slice(0, 4)
    : products.slice(0, 4);

  // --- SIDEBAR CONFIGURATION ---
  const SIDEBAR_GROUPS = [
    {
      title: "Orders & Credits",
      items: [
        { id: 'orders', label: 'Orders', icon: Package, active: true },
        { id: 'wallet', label: 'Wallet / Credits', icon: Wallet },
        { id: 'invite', label: 'Invite Friends', icon: Gift, badge: 'New' },
        { id: 'rewards', label: 'My Rewards', icon: Star },
        { id: 'support', label: 'Customer Care', icon: HelpCircle },
      ]
    },
    {
      title: "Profile",
      items: [
        { id: 'personal', label: 'Personal Information', icon: User },
        { id: 'address', label: 'Address Book', icon: MapPin },
        { id: 'payments', label: 'Payments', icon: CreditCard },
      ]
    }
  ];

  if (pageLoading || isLoading) return <div className="min-h-screen bg-brand-ivory flex items-center justify-center font-serif text-brand-primary">Loading Account...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      
      {/* Page Title Area */}
      <div className="bg-white border-b border-slate-200 mb-8">
        <div className="container mx-auto px-4 py-6">
           <h1 className="text-2xl font-serif text-slate-800">My Account</h1>
           <p className="text-sm text-slate-500 mt-1">Welcome back, {user?.name}</p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT SIDEBAR NAVIGATION */}
          <aside className="w-full lg:w-72 shrink-0 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
             
             {/* User Snippet */}
             <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-primary text-white rounded-full flex items-center justify-center text-xl font-serif font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{user?.email}</p>
                  <p className="text-xs text-slate-500">Member since 2023</p>
                </div>
             </div>

             {/* Navigation Items */}
             <div className="py-2">
                {SIDEBAR_GROUPS.map((group, idx) => (
                  <div key={idx} className="mb-2">
                    <h3 className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">{group.title}</h3>
                    <ul>
                      {group.items.map(item => (
                        <li key={item.id}>
                          <button 
                            className={`w-full flex items-center justify-between px-6 py-3 text-sm font-medium transition-colors ${
                              item.active 
                                ? 'bg-brand-ivory text-brand-primary border-l-4 border-brand-primary' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* <item.icon size={18} /> */}
                              <span>{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.badge && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  {item.badge}
                                </span>
                              )}
                              {item.active && <ChevronRight size={14} />}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
             </div>

             {/* Logout */}
             <div className="p-4 border-t border-slate-100">
               <button 
                 onClick={handleLogout}
                 className="w-full py-2 text-red-600 text-sm font-bold hover:bg-red-50 rounded-lg flex items-center justify-center gap-2 transition-colors"
               >
                 <LogOut size={16} /> Sign Out
               </button>
             </div>
          </aside>

          {/* RIGHT CONTENT AREA - MY ORDERS */}
          <main className="flex-1 w-full bg-white rounded-lg border border-slate-200 shadow-sm min-h-[600px] flex flex-col relative">
             
             {/* Header */}
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold font-serif text-slate-800 flex items-center gap-2">
                  My Orders <span className="text-slate-400 text-sm font-sans font-normal">({orders.length})</span>
                </h2>
                
                {/* Period Dropdown (Mock) */}
                <div className="relative hidden md:block">
                  <button className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
                    {period} <ChevronDown size={14} />
                  </button>
                </div>
             </div>

             {/* Content */}
             <div className="flex-1 p-6">
                {orders.length === 0 ? (
                  // --- EMPTY STATE UI ---
                  <div className="flex flex-col items-center justify-center h-full py-12 text-center animate-fade-in">
                     <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                       <ShoppingBag size={32} />
                     </div>
                     <h3 className="text-xl font-serif font-bold text-slate-800 mb-2">No orders placed</h3>
                     <p className="text-slate-500 text-sm mb-10 max-w-sm mx-auto">
                       You have items in your wishlist waiting to be yours!
                     </p>

                     {/* Suggestions Grid */}
                     <div className="grid grid-cols-4 gap-4 mb-8 w-full max-w-lg">
                        {suggestionItems.map(product => (
                          <Link to={`/product/${product.id}`} key={product.id} className="group block">
                             <div className="aspect-[3/4] bg-slate-100 rounded-md overflow-hidden relative border border-slate-200">
                                <img 
                                  src={product.thumbnail} 
                                  alt={product.title} 
                                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                                />
                             </div>
                          </Link>
                        ))}
                     </div>

                     <Link 
                       to="/wishlist" 
                       className="px-8 py-3 bg-brand-primary text-white text-xs font-bold uppercase tracking-widest rounded shadow-lg hover:bg-brand-secondary transition-transform active:scale-95"
                     >
                       Add From Wishlist
                     </Link>
                  </div>
                ) : (
                  // --- ORDERS LIST UI ---
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="border border-slate-200 rounded-lg p-4 hover:border-brand-primary/30 transition-colors group">
                         <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                            <div>
                               <div className="flex items-center gap-3">
                                  <span className="font-bold text-slate-800">Order #{order.display_id}</span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                                      order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                      order.status === 'canceled' ? 'bg-red-100 text-red-700' :
                                      'bg-blue-100 text-blue-700'
                                  }`}>
                                      {order.status}
                                  </span>
                               </div>
                               <p className="text-xs text-slate-500 mt-1">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="text-left md:text-right">
                               <p className="font-bold text-slate-800">₹{(order.total / 100).toLocaleString()}</p>
                               <button className="text-xs font-bold text-brand-primary hover:underline mt-1">View Invoice</button>
                            </div>
                         </div>
                         
                         {/* Item Previews */}
                         <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {order.items?.map((item: any) => (
                               <div key={item.id} className="shrink-0 w-16 h-20 bg-slate-100 rounded border border-slate-200 overflow-hidden" title={item.title}>
                                  <img src={item.thumbnail} className="w-full h-full object-cover" alt="" />
                               </div>
                            ))}
                         </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>

             {/* Footer Trust Strip */}
             <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 rounded-b-lg">
                <div className="flex flex-col md:flex-row justify-around items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                   <div className="flex items-center gap-2">
                      <RefreshCw size={16} className="text-slate-400" /> Easy Exchange
                   </div>
                   <div className="hidden md:block w-px h-4 bg-slate-300"></div>
                   <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-slate-400" /> 100% Handpicked
                   </div>
                   <div className="hidden md:block w-px h-4 bg-slate-300"></div>
                   <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-slate-400" /> Assured Quality
                   </div>
                </div>
             </div>

          </main>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;