import React from 'react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus, PaymentStatus, FulfillmentStatus } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Package, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { orders, products } = useStore();

  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0) / 100;
  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING).length;
  const pendingPayment = orders.filter(o => o.payment_status === PaymentStatus.AWAITING).length;
  const lowStockProducts = products.filter(p => {
    const stock = p.variants?.reduce((sum, v) => sum + v.inventory_quantity, 0) || 0;
    return stock < 5;
  }).length;
  
  const dailyTasks = [
    { label: 'Verify New COD Orders', count: pendingPayment, link: '/admin/orders' },
    { label: 'Print Shipping Labels', count: orders.filter(o => o.status === OrderStatus.PENDING && o.fulfillment_status === FulfillmentStatus.NOT_FULFILLED).length, link: '/admin/orders' },
    { label: 'Low Stock Restock', count: lowStockProducts, link: '/admin/products' },
  ];

  const data = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-dark rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 font-serif">Good Morning, Operator</h1>
          <p className="opacity-90">Here is your daily summary for Vaibava Lakshmi Shopping Mall.</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-12"></div>
      </div>

      {/* Critical Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dailyTasks.map((task, idx) => (
          <Link to={task.link} key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group hover:border-brand-primary">
            <div>
              <p className="text-slate-500 font-medium mb-1">Task {idx + 1}</p>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-brand-primary transition-colors">{task.label}</h3>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${task.count > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              {task.count}
            </div>
          </Link>
        ))}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1 font-mono">₹{totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-brand-light text-brand-primary rounded-lg h-fit">
              <DollarSign size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Orders</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{pendingOrders}</h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg h-fit">
              <ShoppingBag size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Payment Pending</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{pendingPayment}</h3>
            </div>
            <div className="p-3 bg-brand-gold/20 text-brand-accent rounded-lg h-fit">
              <Clock size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Low Stock</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{lowStockProducts}</h3>
            </div>
            <div className="p-3 bg-red-100 text-red-600 rounded-lg h-fit">
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 font-serif">Weekly Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  cursor={{fill: '#fff1f2'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="sales" fill="#be123c" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 font-serif">Quick Actions</h3>
          <div className="space-y-3">
             <Link to="/admin/products" className="block w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 border border-slate-200 transition-colors">
               + Add New Product
             </Link>
             <Link to="/admin/shipping" className="block w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 border border-slate-200 transition-colors">
               Schedule Pickup (Shiprocket)
             </Link>
             <Link to="/admin/sop" className="block w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 border border-slate-200 transition-colors">
               View Operator SOP
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;