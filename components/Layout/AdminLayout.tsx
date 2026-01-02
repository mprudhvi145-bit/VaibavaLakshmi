import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Settings, 
  Truck, 
  Users, 
  LogOut,
  Bell,
  FileText,
  MessageSquare,
  IndianRupee,
  ShieldCheck
} from 'lucide-react';
import { BRAND_ASSETS } from '../../constants';

const AdminLayout: React.FC = () => {
  const location = useLocation();

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
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col z-10">
        <div className="p-6 border-b border-brand-light">
          <div className="h-8 w-full overflow-hidden" dangerouslySetInnerHTML={{ __html: BRAND_ASSETS.logo_svg }} />
          <p className="text-xs text-slate-500 mt-2 font-medium tracking-wide">ADMINISTRATION</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/admin/orders" icon={ShoppingBag} label="Orders" />
          <NavItem to="/admin/products" icon={Package} label="Products" />
          <NavItem to="/admin/customers" icon={Users} label="Customers" />
          
          <div className="pt-4 mt-4 border-t border-slate-100">
             <p className="px-4 text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Integrations</p>
             <NavItem to="/admin/shipping" icon={Truck} label="Shipping" />
             <NavItem to="/admin/notifications" icon={MessageSquare} label="Notifications" />
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
             <p className="px-4 text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Compliance</p>
             <NavItem to="/admin/finance" icon={IndianRupee} label="Finance & GST" />
             <NavItem to="/admin/sop" icon={ShieldCheck} label="Audit & SOP" />
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
             <NavItem to="/admin/settings" icon={Settings} label="Settings" />
          </div>
        </nav>

        <div className="p-4 border-t">
          <Link to="/" className="flex items-center space-x-3 px-4 py-3 text-brand-primary hover:bg-brand-light rounded-lg transition-colors">
            <LogOut size={20} />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-700 font-serif">
            {location.pathname === '/admin' && 'Overview'}
            {location.pathname === '/admin/orders' && 'Orders'}
            {location.pathname === '/admin/products' && 'Inventory'}
            {location.pathname === '/admin/shipping' && 'Logistics'}
            {location.pathname === '/admin/sop' && 'System Audit'}
            {location.pathname === '/admin/notifications' && 'Communication Logs'}
            {location.pathname === '/admin/finance' && 'Finance & Statutory'}
            {location.pathname === '/admin/customers' && 'Customers'}
          </h2>
          <div className="flex items-center space-x-4">
             <button className="p-2 text-slate-400 hover:text-brand-primary relative transition-colors">
               <Bell size={20} />
               <span className="absolute top-1 right-1 w-2 h-2 bg-brand-primary rounded-full"></span>
             </button>
             <div className="flex items-center space-x-2">
               <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm">OP</div>
               <span className="text-sm font-medium text-slate-700">Operator</span>
             </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;