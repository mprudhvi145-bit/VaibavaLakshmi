import React from 'react';
import { Truck, MapPin, Package, Settings, ExternalLink } from 'lucide-react';

const Shipping: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-slate-800">Shipping & Logistics</h2>
           <p className="text-slate-500 text-sm">Manage carriers, pickup locations, and automation.</p>
        </div>
        <button className="px-4 py-2 bg-slate-800 text-white rounded text-sm font-medium hover:bg-slate-900">
             Sync Orders
        </button>
      </div>

      {/* Integration Status */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
            <div className="flex gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700">
                    <Truck size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Shiprocket Integration</h3>
                    <p className="text-sm text-slate-500">Connected to account: <strong>vaibava_logistics_01</strong></p>
                    <div className="flex gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">Active</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">Auto-Sync On</span>
                    </div>
                </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600"><Settings size={20} /></button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-100">
            <div>
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Pickup Location</p>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <MapPin size={16} /> Warangal Warehouse (Primary)
                </div>
            </div>
            <div>
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Default Dimensions</p>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <Package size={16} /> 30 x 20 x 5 cm (0.5kg)
                </div>
            </div>
            <div>
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Wallet Balance</p>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                    ₹ 2,450.00
                </div>
            </div>
        </div>
      </div>

      {/* Serviceability Check */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Courier Serviceability Check</h3>
            <div className="flex gap-2">
                <input type="text" placeholder="Enter Pincode" className="flex-1 border rounded-lg px-4 py-2 text-sm" />
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">Check</button>
            </div>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-blue-600">
                <li><a href="#" className="flex items-center hover:underline"><ExternalLink size={14} className="mr-2"/> Shiprocket Dashboard</a></li>
                <li><a href="#" className="flex items-center hover:underline"><ExternalLink size={14} className="mr-2"/> Rate Calculator</a></li>
                <li><a href="#" className="flex items-center hover:underline"><ExternalLink size={14} className="mr-2"/> Pickup Exception List</a></li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default Shipping;