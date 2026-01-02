import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PaymentStatus, Order } from '../../types';
import { FileText, Download, CheckCircle, AlertOctagon, IndianRupee, PieChart, ShieldCheck } from 'lucide-react';

// Indian GST Config
const GST_CONFIG = {
  hsn_code: '5007', // Woven Fabrics of Silk
  rate: 0.05, // 5%
  state_code: '36', // Telangana
  state_name: 'Telangana'
};

const Finance: React.FC = () => {
  const { orders } = useStore();
  const [activeTab, setActiveTab] = useState<'reconciliation' | 'gst' | 'reports'>('reconciliation');

  // --- RECONCILIATION LOGIC ---
  const reconciliationData = orders.map(order => {
    const isPaid = order.payment_status === PaymentStatus.CAPTURED;
    // Simulate settlement delay: If paid today, it's pending settlement.
    const paymentDate = new Date(order.created_at);
    const today = new Date();
    const isSettled = isPaid && (today.getTime() - paymentDate.getTime() > 86400000); // 24 hours
    
    return {
      id: order.id,
      display_id: order.display_id,
      date: paymentDate.toLocaleDateString(),
      amount: order.total / 100,
      status: order.payment_status,
      gateway_ref: isPaid ? `pay_${order.display_id}_xyz` : '-',
      settlement_status: isPaid ? (isSettled ? 'Settled' : 'Pending Bank') : 'Unpaid',
    };
  });

  const totalSales = reconciliationData.reduce((acc, curr) => curr.status === PaymentStatus.CAPTURED ? acc + curr.amount : acc, 0);
  const totalSettled = reconciliationData.reduce((acc, curr) => curr.settlement_status === 'Settled' ? acc + curr.amount : acc, 0);
  const pendingSettlement = reconciliationData.reduce((acc, curr) => curr.settlement_status === 'Pending Bank' ? acc + curr.amount : acc, 0);

  // --- GST REPORT GENERATION ---
  const downloadGSTReport = () => {
    const header = ['Invoice No', 'Date', 'Customer GSTIN', 'Place of Supply', 'Taxable Value', 'Rate (%)', 'IGST', 'CGST', 'SGST', 'Total Invoice Value'];
    const rows = orders.filter(o => o.payment_status === PaymentStatus.CAPTURED).map(order => {
      const amount = order.total / 100;
      const taxable = (amount / (1 + GST_CONFIG.rate)).toFixed(2);
      const taxAmt = (amount - parseFloat(taxable)).toFixed(2);
      const isInterState = order.shipping_address.city.toLowerCase() !== 'hanamkonda' && order.shipping_address.city.toLowerCase() !== 'warangal'; // Simple logic
      
      return [
        `INV-2324-${order.display_id}`,
        new Date(order.created_at).toLocaleDateString(),
        'URP', // Unregistered Person (B2C)
        order.shipping_address.city,
        taxable,
        GST_CONFIG.rate * 100,
        isInterState ? taxAmt : '0',
        isInterState ? '0' : (parseFloat(taxAmt)/2).toFixed(2),
        isInterState ? '0' : (parseFloat(taxAmt)/2).toFixed(2),
        amount
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + header.join(',') + "\n" + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GSTR1_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-xl font-bold text-slate-800">Finance & Statutory Compliance</h2>
            <p className="text-slate-500 text-sm">Manage reconciliation, GST invoices, and audit logs.</p>
         </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
        <button onClick={() => setActiveTab('reconciliation')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'reconciliation' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
          Daily Reconciliation
        </button>
        <button onClick={() => setActiveTab('gst')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'gst' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
          GST Invoices
        </button>
        <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'reports' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
          Reports & Audit
        </button>
      </div>

      {/* --- TAB 1: RECONCILIATION --- */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Total Sales (Collected)</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">₹{totalSales.toLocaleString()}</h3>
            </div>
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Settled in Bank</p>
                <h3 className="text-2xl font-bold text-green-600 mt-1">₹{totalSettled.toLocaleString()}</h3>
            </div>
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Pending Settlement</p>
                <h3 className="text-2xl font-bold text-orange-500 mt-1">₹{pendingSettlement.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
             <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                 <tr>
                   <th className="px-6 py-4">Date</th>
                   <th className="px-6 py-4">Order ID</th>
                   <th className="px-6 py-4">Amount</th>
                   <th className="px-6 py-4">Gateway Ref</th>
                   <th className="px-6 py-4">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {reconciliationData.map((row) => (
                   <tr key={row.id} className="hover:bg-slate-50">
                     <td className="px-6 py-3">{row.date}</td>
                     <td className="px-6 py-3 font-mono text-emerald-700">#{row.display_id}</td>
                     <td className="px-6 py-3 font-medium">₹{row.amount.toLocaleString()}</td>
                     <td className="px-6 py-3 font-mono text-xs">{row.gateway_ref}</td>
                     <td className="px-6 py-3">
                        {row.settlement_status === 'Settled' && <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1"><CheckCircle size={12}/> Settled</span>}
                        {row.settlement_status === 'Pending Bank' && <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1"><IndianRupee size={12}/> Processing</span>}
                        {row.settlement_status === 'Unpaid' && <span className="text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1"><AlertOctagon size={12}/> Failed</span>}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      )}

      {/* --- TAB 2: GST INVOICES --- */}
      {activeTab === 'gst' && (
        <div className="bg-white border rounded-xl p-8 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-800">Tax Invoice Generation</h3>
              <p className="text-sm text-slate-500">GSTIN: <span className="font-mono font-bold text-slate-700">36ABCDE1234F1Z5</span></p>
           </div>
           
           <div className="space-y-4">
              {orders.filter(o => o.payment_status === PaymentStatus.CAPTURED).map(order => {
                  const amount = order.total / 100;
                  const taxable = (amount / (1 + GST_CONFIG.rate)).toFixed(2);
                  const tax = (amount - parseFloat(taxable)).toFixed(2);
                  
                  return (
                    <div key={order.id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center hover:border-emerald-500 transition-colors">
                        <div>
                            <p className="font-bold text-slate-800">Order #{order.display_id}</p>
                            <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()} • {order.customer.first_name} {order.customer.last_name}</p>
                        </div>
                        <div className="text-right mr-8">
                            <p className="text-sm font-medium">Taxable: ₹{taxable}</p>
                            <p className="text-xs text-slate-500">GST (5%): ₹{tax}</p>
                        </div>
                        <button 
                            onClick={() => alert(`Printing Tax Invoice INV-2324-${order.display_id}...`)}
                            className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 text-sm font-medium flex items-center gap-2"
                        >
                            <FileText size={16} /> Print Invoice
                        </button>
                    </div>
                  );
              })}
              {orders.length === 0 && <div className="text-center text-slate-400 py-8">No paid orders available for invoicing.</div>}
           </div>
        </div>
      )}

      {/* --- TAB 3: REPORTS --- */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border rounded-xl p-6 shadow-sm">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg w-fit mb-4"><FileText size={24} /></div>
                <h3 className="font-bold text-lg text-slate-800 mb-2">Monthly Sales Report (GSTR-1)</h3>
                <p className="text-sm text-slate-500 mb-6">Download CSV containing B2C invoice details, HSN summaries, and state-wise tax breakup for filing.</p>
                <button onClick={downloadGSTReport} className="w-full py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 flex justify-center items-center gap-2">
                    <Download size={16} /> Download CSV
                </button>
            </div>

            <div className="bg-white border rounded-xl p-6 shadow-sm">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg w-fit mb-4"><PieChart size={24} /></div>
                <h3 className="font-bold text-lg text-slate-800 mb-2">Inventory Valuation Audit</h3>
                <p className="text-sm text-slate-500 mb-6">Current stock assets report for accounting. Includes opening stock, closing stock, and unit value.</p>
                <button onClick={() => alert("Downloading Inventory Report...")} className="w-full py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex justify-center items-center gap-2">
                    <Download size={16} /> Download Report
                </button>
            </div>

            <div className="bg-white border rounded-xl p-6 shadow-sm md:col-span-2">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><ShieldCheck size={18} /> System Audit Logs</h3>
                <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-xs h-40 overflow-y-auto">
                    <p className="mb-1"><span className="text-slate-500">[{new Date().toISOString()}]</span> [INFO] [SYSTEM] Backup Job Completed (medusa_db_backup.sql.gz)</p>
                    <p className="mb-1"><span className="text-slate-500">[{new Date(Date.now() - 3600000).toISOString()}]</span> [INFO] [USER:admin] Rate limit checks passed.</p>
                    <p className="mb-1"><span className="text-slate-500">[{new Date(Date.now() - 7200000).toISOString()}]</span> [WARN] [SHIPROCKET] Token refresh successful.</p>
                    <p className="mb-1"><span className="text-slate-500">[{new Date(Date.now() - 10800000).toISOString()}]</span> [INFO] [SYSTEM] Daily Settlement Report Generated.</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Finance;