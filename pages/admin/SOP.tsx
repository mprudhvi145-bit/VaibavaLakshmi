import React, { useState } from 'react';
import { Book, Server, Shield, FileText, Code, Database } from 'lucide-react';

const SOP: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sop' | 'architecture'>('sop');

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex justify-center space-x-2 bg-white p-1 rounded-lg shadow-sm border w-fit mx-auto">
        <button onClick={() => setActiveTab('sop')} className={`px-6 py-2 rounded-md ${activeTab === 'sop' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}>Operator SOP</button>
        <button onClick={() => setActiveTab('architecture')} className={`px-6 py-2 rounded-md ${activeTab === 'architecture' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}>Architecture</button>
      </div>

      {activeTab === 'sop' && (
        <div className="bg-white border rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-800 mb-6"><Book className="inline mr-2" /> Live System SOP</h2>
            <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded border-l-4 border-emerald-500">
                    <h3 className="font-bold">1. Order Processing</h3>
                    <p>Go to <strong>Orders</strong>. The list is fetched live from Supabase. Use the admin panel to update statuses (Pack, Ship) which updates the central database.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded border-l-4 border-blue-500">
                    <h3 className="font-bold">2. Bulk Updates</h3>
                    <p>To update stock, use the <strong>Products &gt; Bulk Import</strong> tool. This parses your CSV in the browser and securely updates the Postgres database via RLS.</p>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'architecture' && (
        <div className="bg-white border rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-800 mb-6"><Server className="inline mr-2" /> Serverless Architecture</h2>
            <p className="mb-4">This application runs entirely in the browser (AI Studio) and connects directly to Supabase.</p>
            <div className="space-y-2">
                <p><strong>Database:</strong> PostgreSQL (Supabase)</p>
                <p><strong>Auth:</strong> Supabase Auth</p>
                <p><strong>Storage:</strong> Supabase Storage</p>
                <p><strong>Frontend:</strong> React + Vite</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default SOP;