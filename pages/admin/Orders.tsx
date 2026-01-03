
import React, { useEffect, useState } from 'react';
import { AdminService } from '../../services/admin.service';
import { Truck, Package, XCircle, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
        const data = await AdminService.getOrders(filter === 'all' ? undefined : filter);
        setOrders(data);
    } catch (e) {
        console.error("Failed to load orders");
    } finally {
        setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'paid': return 'bg-blue-100 text-blue-700';
          case 'packed': return 'bg-purple-100 text-purple-700';
          case 'shipped': return 'bg-orange-100 text-orange-700';
          case 'delivered': return 'bg-green-100 text-green-700';
          case 'canceled': return 'bg-red-100 text-red-700';
          default: return 'bg-slate-100 text-slate-600';
      }
  };

  const getStatusIcon = (status: string) => {
      switch(status) {
          case 'paid': return <CheckCircle size={14}/>;
          case 'packed': return <Package size={14}/>;
          case 'shipped': return <Truck size={14}/>;
          case 'canceled': return <XCircle size={14}/>;
          default: return <Clock size={14}/>;
      }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">Order Management</h2>
        <div className="flex gap-2 bg-white p-1 rounded-lg border shadow-sm">
            {['all', 'paid', 'packed', 'shipped'].map(f => (
                <button 
                    key={f} 
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-colors ${filter === f ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    {f}
                </button>
            ))}
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm min-h-[400px]">
        {isLoading ? (
            <div className="p-8 text-center text-slate-400">Loading orders...</div>
        ) : (
            <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-right">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {orders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 font-mono text-emerald-700 font-bold">
                        <Link to={`/admin/orders/${order.id}`} className="hover:underline">#{order.display_id}</Link>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{order.customer.first_name} {order.customer.last_name}</div>
                        <div className="text-slate-400 text-xs">{order.customer.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)} {order.status.toUpperCase()}
                        </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">₹{(order.total / 100).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                        <Link to={`/admin/orders/${order.id}`} className="text-brand-primary font-bold text-xs border border-brand-primary px-3 py-1.5 rounded hover:bg-brand-primary hover:text-white transition-colors">
                            Manage
                        </Link>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
        {!isLoading && orders.length === 0 && <div className="p-12 text-center text-slate-400">No orders found.</div>}
      </div>
    </div>
  );
};

export default Orders;
