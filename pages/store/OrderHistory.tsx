import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { Package, ChevronRight, LogOut, ShoppingBag } from 'lucide-react';

const OrderHistory: React.FC = () => {
  const { user, fetchCustomerOrders, logout, isLoading } = useStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

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

  if (pageLoading || isLoading) return <div className="min-h-screen bg-brand-ivory flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b shadow-sm mb-8">
          <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                      <h1 className="text-2xl font-serif text-slate-800">My Account</h1>
                      <p className="text-slate-500">Welcome back, {user?.name}</p>
                  </div>
                  <button onClick={handleLogout} className="text-sm font-medium text-red-600 flex items-center gap-2 border border-red-100 px-4 py-2 rounded-lg hover:bg-red-50">
                      <LogOut size={16} /> Sign Out
                  </button>
              </div>
          </div>
      </div>

      <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Package size={20} /> Order History
          </h2>

          {orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <ShoppingBag size={24} />
                  </div>
                  <p className="text-slate-500 mb-6">You haven't placed any orders yet.</p>
                  <button onClick={() => navigate('/catalog')} className="px-6 py-2 bg-brand-primary text-white rounded-lg font-bold text-sm">Start Shopping</button>
              </div>
          ) : (
              <div className="space-y-4">
                  {orders.map(order => (
                      <div key={order.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                          <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between gap-4">
                              <div>
                                  <div className="flex items-center gap-3 mb-2">
                                      <span className="font-mono font-bold text-lg text-slate-800">#{order.display_id}</span>
                                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                          order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                          order.status === 'canceled' ? 'bg-red-100 text-red-700' :
                                          'bg-blue-100 text-blue-700'
                                      }`}>
                                          {order.status}
                                      </span>
                                  </div>
                                  <p className="text-sm text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                  <p className="font-bold text-slate-800 text-lg">₹{(order.total / 100).toLocaleString()}</p>
                                  <p className="text-sm text-slate-500">{order.items?.length || 0} Items</p>
                              </div>
                          </div>
                          
                          <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex justify-between items-center">
                              <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                                  {order.fulfillment_status === 'shipped' ? `Tracking: ${order.metadata?.tracking_number}` : ''}
                              </span>
                              <button className="text-sm font-bold text-brand-primary flex items-center hover:underline">
                                  View Details <ChevronRight size={16} />
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
};

export default OrderHistory;