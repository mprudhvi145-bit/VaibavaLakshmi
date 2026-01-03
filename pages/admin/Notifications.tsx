
import React, { useEffect, useState } from 'react';
import { AdminService } from '../../services/admin.service';
import { MessageSquare, Mail, Smartphone, Check, Clock, AlertCircle, RotateCcw } from 'lucide-react';

const Notifications: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
        const data = await AdminService.getNotifications();
        setLogs(data);
    } catch (e) {
        console.error("Failed to load notifications");
    } finally {
        setIsLoading(false);
    }
  };

  const handleRetry = async (id: string) => {
      setRetryingId(id);
      try {
          await AdminService.retryNotification(id);
          // Refresh list to see updated count/status
          await loadLogs();
      } catch (e) {
          alert("Retry failed. Check console.");
      }
      setRetryingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-slate-800">Notifications & Logs</h2>
           <p className="text-slate-500 text-sm">Monitor automated messages sent via WhatsApp, Email, and SMS.</p>
        </div>
        <button onClick={loadLogs} className="text-sm text-brand-primary underline hover:text-brand-secondary">Refresh Logs</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Channels */}
         <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg"><MessageSquare size={24} /></div>
            <div>
                <p className="font-bold text-slate-800">WhatsApp API</p>
                <p className="text-xs text-green-600 font-medium">Active (Simulated)</p>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Mail size={24} /></div>
            <div>
                <p className="font-bold text-slate-800">Email (SMTP)</p>
                <p className="text-xs text-green-600 font-medium">Active (Simulated)</p>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><Smartphone size={24} /></div>
            <div>
                <p className="font-bold text-slate-800">SMS (Fallback)</p>
                <p className="text-xs text-slate-400 font-medium">Disabled</p>
            </div>
         </div>
      </div>

      {/* Logs */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-700">Message History</h3>
            <span className="text-xs text-slate-500">Showing last 100 entries</span>
        </div>
        
        {isLoading ? (
            <div className="p-8 text-center text-slate-400">Loading logs...</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                <thead className="text-slate-500 font-medium border-b bg-slate-50">
                    <tr>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Channel</th>
                    <th className="px-6 py-3">Recipient</th>
                    <th className="px-6 py-3">Template</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {logs.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-slate-400 italic">
                                No notifications found. Place an order to generate logs.
                            </td>
                        </tr>
                    ) : (
                        logs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50 group">
                                <td className="px-6 py-3 text-slate-500 whitespace-nowrap">
                                    {new Date(log.created_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-3 font-mono text-emerald-700">{log.order_id}</td>
                                <td className="px-6 py-3">
                                    {log.channel === 'whatsapp' && <span className="flex items-center gap-1 text-green-600 font-bold"><MessageSquare size={14}/> WA</span>}
                                    {log.channel === 'email' && <span className="flex items-center gap-1 text-blue-600 font-bold"><Mail size={14}/> Email</span>}
                                </td>
                                <td className="px-6 py-3 text-slate-700 font-mono text-xs">{log.recipient}</td>
                                <td className="px-6 py-3 text-slate-700 text-xs uppercase font-bold">{log.template_id}</td>
                                <td className="px-6 py-3">
                                    {log.status === 'success' ? (
                                        <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded w-fit">
                                            <Check size={14}/> Sent {log.retry_count > 0 ? `(${log.retry_count})` : ''}
                                        </span>
                                    ) : log.status === 'failed' ? (
                                        <span className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded w-fit" title={log.error_message}>
                                            <AlertCircle size={14}/> Failed
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-orange-500 text-xs font-bold bg-orange-50 px-2 py-1 rounded w-fit">
                                            <Clock size={14}/> Pending
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-3 text-right">
                                    {log.status === 'failed' && (
                                        <button 
                                            onClick={() => handleRetry(log.id)}
                                            disabled={retryingId === log.id}
                                            className="text-xs text-blue-600 font-bold hover:underline flex items-center justify-end gap-1 ml-auto"
                                        >
                                            <RotateCcw size={12} className={retryingId === log.id ? 'animate-spin' : ''} /> 
                                            {retryingId === log.id ? 'Sending...' : 'Retry'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
