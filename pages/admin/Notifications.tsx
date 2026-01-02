import React from 'react';
import { useStore } from '../../context/StoreContext';
import { MessageSquare, Mail, Smartphone, Check, Clock } from 'lucide-react';

const Notifications: React.FC = () => {
  const { notifications } = useStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-slate-800">Notifications & Logs</h2>
           <p className="text-slate-500 text-sm">Monitor automated messages sent via WhatsApp, Email, and SMS.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Channels */}
         <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg"><MessageSquare size={24} /></div>
            <div>
                <p className="font-bold text-slate-800">WhatsApp API</p>
                <p className="text-xs text-green-600 font-medium">Connected (Interakt/WATI)</p>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Mail size={24} /></div>
            <div>
                <p className="font-bold text-slate-800">Email (SendGrid)</p>
                <p className="text-xs text-green-600 font-medium">Connected</p>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><Smartphone size={24} /></div>
            <div>
                <p className="font-bold text-slate-800">SMS (Fast2SMS)</p>
                <p className="text-xs text-slate-400 font-medium">Disabled</p>
            </div>
         </div>
      </div>

      {/* Logs */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b bg-slate-50">
            <h3 className="font-bold text-slate-700">Recent Activity Log</h3>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="text-slate-500 font-medium border-b bg-slate-50">
            <tr>
              <th className="px-6 py-3">Timestamp</th>
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">Channel</th>
              <th className="px-6 py-3">Template</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {notifications.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">
                        No notifications sent in this session. Process an order to see logs.
                    </td>
                </tr>
            ) : (
                notifications.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 text-slate-500">{new Date(log.created_at).toLocaleTimeString()}</td>
                        <td className="px-6 py-3 font-mono text-emerald-700">{log.order_id}</td>
                        <td className="px-6 py-3">
                            {log.channel === 'WHATSAPP' && <span className="flex items-center gap-1 text-green-600"><MessageSquare size={14}/> WhatsApp</span>}
                            {log.channel === 'EMAIL' && <span className="flex items-center gap-1 text-blue-600"><Mail size={14}/> Email</span>}
                        </td>
                        <td className="px-6 py-3 text-slate-700">{log.template}</td>
                        <td className="px-6 py-3">
                            {log.status === 'success' ? (
                                <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><Check size={14}/> Sent</span>
                            ) : (
                                <span className="flex items-center gap-1 text-orange-500 text-xs font-bold"><Clock size={14}/> Pending</span>
                            )}
                        </td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Notifications;