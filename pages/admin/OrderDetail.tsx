
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminService } from '../../services/admin.service';
import { ArrowLeft, Package, Truck, XCircle, MapPin, User, ShieldCheck, Printer } from 'lucide-react';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Shipping Modal State
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [carrier, setCarrier] = useState('');
  const [tracking, setTracking] = useState('');

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
        const data = await AdminService.getOrderDetails(id);
        setOrder(data);
    } catch (e) {
        alert("Failed to load order");
        navigate('/admin/orders');
    } finally {
        setLoading(false);
    }
  };

  const handlePack = async () => {
      if(!window.confirm("Confirm items are picked and packed?")) return;
      setProcessing(true);
      try {
          await AdminService.markOrderPacked(id!);
          loadOrder();
      } catch (e) {
          alert("Error packing order");
      }
      setProcessing(false);
  };

  const handleShip = async (e: React.FormEvent) => {
      e.preventDefault();
      setProcessing(true);
      try {
          await AdminService.shipOrder(id!, carrier, tracking);
          setIsShipModalOpen(false);
          loadOrder();
      } catch (e) {
          alert("Error shipping order");
      }
      setProcessing(false);
  };

  const handleCancel = async () => {
      const reason = prompt("Enter cancellation reason:");
      if (!reason) return;
      setProcessing(true);
      try {
          await AdminService.cancelOrder(id!, reason);
          loadOrder();
      } catch (e) {
          alert("Error canceling order");
      }
      setProcessing(false);
  };

  if (loading || !order) return <div className="p-8 text-center">Loading Detail...</div>;

  return (
    <div className="pb-24 max-w-5xl mx-auto">
      {/* Navigation */}
      <button onClick={() => navigate('/admin/orders')} className="flex items-center text-slate-500 mb-6 hover:text-slate-800">
          <ArrowLeft size={18} className="mr-2" /> Back to Orders
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                  Order #{order.display_id}
                  <span className="text-sm px-3 py-1 bg-slate-100 rounded-full font-medium text-slate-600 uppercase tracking-wide border">
                      {order.status}
                  </span>
              </h1>
              <p className="text-slate-500 text-sm mt-1">Placed on {new Date(order.created_at).toLocaleString()}</p>
          </div>
          <div className="flex gap-3">
              <button onClick={() => window.print()} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-bold flex items-center gap-2 hover:bg-slate-50">
                  <Printer size={16} /> Print Invoice
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
              
              {/* Line Items */}
              <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-6 py-3 border-b font-bold text-slate-700">Ordered Items ({order.items.length})</div>
                  <div className="divide-y divide-slate-100">
                      {order.items.map((item: any) => (
                          <div key={item.id} className="p-4 flex gap-4">
                              <img src={item.thumbnail} className="w-16 h-16 rounded bg-slate-100 object-cover border" />
                              <div className="flex-1">
                                  <h4 className="font-bold text-slate-800">{item.title}</h4>
                                  <p className="text-sm text-slate-500">SKU: {item.sku}</p>
                              </div>
                              <div className="text-right">
                                  <p className="font-medium">₹{(item.unit_price / 100).toLocaleString()}</p>
                                  <p className="text-sm text-slate-500">x {item.quantity}</p>
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="bg-slate-50 p-4 border-t flex justify-between items-center">
                      <span className="font-bold text-slate-600">Total Amount</span>
                      <span className="font-bold text-xl text-slate-900">₹{(order.total / 100).toLocaleString()}</span>
                  </div>
              </div>

              {/* Fulfillment Info */}
              {order.status === 'shipped' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                      <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-2"><Truck size={20}/> Shipment Details</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm text-blue-900">
                          <div>
                              <p className="opacity-70 text-xs uppercase font-bold">Carrier</p>
                              <p className="font-medium">{order.fulfillment_provider || 'Manual'}</p>
                          </div>
                          <div>
                              <p className="opacity-70 text-xs uppercase font-bold">Tracking Number</p>
                              <p className="font-mono font-medium">{order.tracking_number || 'N/A'}</p>
                          </div>
                      </div>
                  </div>
              )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
              
              {/* Customer */}
              <div className="bg-white border rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><User size={18}/> Customer</h3>
                  <div className="text-sm text-slate-600 space-y-1">
                      <p className="font-medium text-slate-900">{order.customer.first_name} {order.customer.last_name}</p>
                      <p>{order.email}</p>
                      <p>{order.customer.phone}</p>
                  </div>
              </div>

              {/* Address */}
              <div className="bg-white border rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><MapPin size={18}/> Shipping Address</h3>
                  <div className="text-sm text-slate-600 space-y-1">
                      <p>{order.shipping_address.address_1}</p>
                      <p>{order.shipping_address.city}, {order.shipping_address.postal_code}</p>
                      <p>Phone: {order.shipping_address.phone}</p>
                  </div>
              </div>

              {/* Audit / Safety */}
              <div className="bg-white border rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><ShieldCheck size={18}/> Payment</h3>
                  <p className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded w-fit font-bold">
                      VERIFIED via {order.payment_provider || 'Gateway'}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 font-mono">{order.payment_transaction_id}</p>
              </div>
          </div>
      </div>

      {/* Sticky Action Bar (Mobile Friendly) */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40 flex justify-end gap-3">
          {order.status === 'paid' && (
              <>
                <button onClick={handleCancel} disabled={processing} className="px-6 py-3 rounded-lg border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors">
                    Cancel Order
                </button>
                <button onClick={handlePack} disabled={processing} className="px-6 py-3 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-lg flex items-center gap-2">
                    <Package size={18} /> Mark as Packed
                </button>
              </>
          )}
          
          {order.status === 'packed' && (
              <>
                <button onClick={handleCancel} disabled={processing} className="px-6 py-3 rounded-lg border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors">
                    Cancel Order
                </button>
                <button onClick={() => setIsShipModalOpen(true)} disabled={processing} className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg flex items-center gap-2">
                    <Truck size={18} /> Ship Order
                </button>
              </>
          )}

          {(order.status === 'shipped' || order.status === 'canceled') && (
              <div className="text-slate-500 font-medium italic py-2">No further actions available.</div>
          )}
      </div>

      {/* Shipping Modal */}
      {isShipModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Shipment Details</h3>
                  <form onSubmit={handleShip} className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Carrier Name</label>
                          <select className="w-full border rounded-lg p-2" required value={carrier} onChange={e => setCarrier(e.target.value)}>
                              <option value="">Select Carrier</option>
                              <option value="DTDC">DTDC</option>
                              <option value="BlueDart">BlueDart</option>
                              <option value="Delhivery">Delhivery</option>
                              <option value="Manual">Manual / Local</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tracking Number</label>
                          <input type="text" className="w-full border rounded-lg p-2" required value={tracking} onChange={e => setTracking(e.target.value)} placeholder="AWB123456789" />
                      </div>
                      <div className="flex gap-2 pt-4">
                          <button type="button" onClick={() => setIsShipModalOpen(false)} className="flex-1 py-2 border rounded-lg font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                          <button type="submit" disabled={processing} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-lg">Confirm Shipment</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default OrderDetail;
