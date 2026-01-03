
import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Settings, 
  Truck, 
  LogOut,
  Bell,
  FolderTree,
  Search,
  IndianRupee,
  ShieldCheck,
  BarChart2
} from 'lucide-react';
import { BRAND_ASSETS } from '../../constants';
import { useStore } from '../../context/StoreContext';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useStore();

  useEffect(() => {
    if (!isAuthenticated) {
        navigate('/admin/login', { state: { from: location } });
    }
  }, [isAuthenticated, navigate, location]);

  const handleLogout = () => {
      logout();
      navigate('/admin/login');
  };

  if (!isAuthenticated) return null; // Or a loading spinner while redirect happens

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <Link 
      to={to} 
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        location.pathname === to 
        ? 'bg-brand-light text-brand-primary border-r-4 border-brand-primary' 
        : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col z-10 hidden md:flex">
        <div className="p-6 border-b border-brand-light">
          <div className="h-8 w-full overflow-hidden" dangerouslySetInnerHTML={{ __html: BRAND_ASSETS.logo_svg }} />
          <p className="text-xs text-slate-500 mt-2 font-medium tracking-wide uppercase">Operator Console</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/admin/analytics" icon={BarChart2} label="Analytics" /> {/* New */}
          <NavItem to="/admin/orders" icon={ShoppingBag} label="Orders" />
          
          <div className="pt-4 mt-4 border-t border-slate-100">
             <p className="px-4 text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Catalog</p>
             <NavItem to="/admin/products" icon={Package} label="Inventory & CSV" />
             <NavItem to="/admin/categories" icon={FolderTree} label="Category Rules" />
             <NavItem to="/admin/search-health" icon={Search} label="Search Engine" />
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
             <p className="px-4 text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Logistics</p>
             <NavItem to="/admin/shipping" icon={Truck} label="Shipping" />
             <NavItem to="/admin/finance" icon={IndianRupee} label="Finance & GST" />
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
             <NavItem to="/admin/sop" icon={ShieldCheck} label="System Audit" />
             {user?.role === 'owner' && (
                <NavItem to="/admin/settings" icon={Settings} label="Settings" />
             )}
          </div>
        </nav>

        <div className="p-4 border-t">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-brand-primary hover:bg-brand-light rounded-lg transition-colors">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-8 border-b border-slate-200">
          <div className="md:hidden">
             <span className="font-serif font-bold text-brand-primary">Vaibava Admin</span>
          </div>
          <h2 className="hidden md:block text-lg font-bold text-slate-700 font-serif">
            {location.pathname === '/admin' && 'System Overview'}
            {location.pathname === '/admin/orders' && 'Order Processing'}
            {location.pathname === '/admin/analytics' && 'Business Intelligence'}
            {location.pathname === '/admin/products' && 'Product Database'}
            {location.pathname === '/admin/categories' && 'Taxonomy Governance'}
          </h2>
          <div className="flex items-center space-x-4">
             <button className="p-2 text-slate-400 hover:text-brand-primary relative transition-colors">
               <Bell size={20} />
               <span className="absolute top-1 right-1 w-2 h-2 bg-brand-primary rounded-full"></span>
             </button>
             <div className="flex items-center space-x-2">
               <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                   {user?.name?.[0] || 'OP'}
               </div>
               <div className="hidden md:flex flex-col items-start">
                   <span className="text-sm font-medium text-slate-700">{user?.name || 'Operator'}</span>
                   <span className="text-[10px] uppercase font-bold text-slate-400">{user?.role || 'Viewer'}</span>
               </div>
             </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
