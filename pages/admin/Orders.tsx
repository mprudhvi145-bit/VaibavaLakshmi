import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Eye, Printer, Truck, Check } from 'lucide-react';
import { OrderStatus, FulfillmentStatus } from '../../types';

const Orders: React.FC = () => {
  const { orders, refreshAdminData, generateShippingLabel, isAuthenticated, login } = useStore();
  
  // Basic Auth Gate for Admin Panel Demo
  const [email, setEmail] = useState('admin@medusa-test.com');
  const [pass, setPass] = useState('supersecret');

  useEffect(() => {
    if(isAuthenticated) refreshAdminData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="p-10 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Admin Login</h2>
        <input className="w-full border p-2 mb-2" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input className="w-full border p-2 mb-4" type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" />
        <button onClick={() => login(email, pass)} className="w-full bg-emerald-800 text-white p-2 rounded">Login to Medusa</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Real Order Management</h2>
        <button onClick={refreshAdminData} className="text-sm text-emerald-600 hover:underline">Refresh Data</button>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Fulfillment</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono text-emerald-700">#{order.display_id}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{order.customer.first_name} {order.customer.last_name}</div>
                  <div className="text-slate-500 text-xs">{order.customer.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold">{order.status}</span>
                </td>
                <td className="px-6 py-4">
                   <span className={`px-2 py-1 rounded text-xs font-bold ${order.fulfillment_status === FulfillmentStatus.SHIPPED ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                     {order.fulfillment_status}
                   </span>
                </td>
                <td className="px-6 py-4 font-bold">₹{(order.total / 100).toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {order.fulfillment_status === FulfillmentStatus.NOT_FULFILLED && (
                       <button onClick={() => generateShippingLabel(order.id)} className="p-1.5 text-blue-600 bg-blue-50 border border-blue-200 rounded">
                         <Truck size={16} />
                       </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="p-8 text-center text-slate-500">No orders found in Medusa Backend.</div>}
      </div>
    </div>
  );
};

export default Orders;