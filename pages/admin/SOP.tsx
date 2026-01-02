import React, { useState } from 'react';
import { Book, Server, Shield, FileText, Code, Database } from 'lucide-react';

const SOP: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sop' | 'architecture' | 'deployment'>('sop');

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex justify-center space-x-2 bg-white p-1 rounded-lg shadow-sm border w-fit mx-auto">
        <button onClick={() => setActiveTab('sop')} className={`px-6 py-2 rounded-md ${activeTab === 'sop' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}>Operator SOP</button>
        <button onClick={() => setActiveTab('deployment')} className={`px-6 py-2 rounded-md ${activeTab === 'deployment' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}>Deployment</button>
      </div>

      {activeTab === 'sop' && (
        <div className="bg-white border rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-800 mb-6"><Book className="inline mr-2" /> Live System SOP</h2>
            <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded border-l-4 border-emerald-500">
                    <h3 className="font-bold">1. Order Processing</h3>
                    <p>Go to <strong>Orders</strong>. The list is fetched live from Medusa. Click the <strong>Truck Icon</strong> on any unfulfilled order. This triggers the Backend Shiprocket Service to generate a label and update the database.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded border-l-4 border-blue-500">
                    <h3 className="font-bold">2. Bulk Updates</h3>
                    <p>To update stock, use the <strong>Products > Bulk Import</strong> tool. This sends your CSV to the `/admin/products/bulk` endpoint where the backend parses and updates Postgres.</p>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'deployment' && (
        <div className="bg-white border rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-800 mb-6"><Server className="inline mr-2" /> Backend Deployment</h2>
            <p className="mb-4">Follow the steps in <code>backend-setup-guide.md</code> included in the codebase.</p>
            <pre className="bg-slate-900 text-slate-50 p-4 rounded text-xs font-mono">
{`# 1. Build Backend Image
docker build -t medusa-backend ./medusa-backend

# 2. Run Database
docker run --name medusa-db -e POSTGRES_PASSWORD=pass -d postgres

# 3. Run Backend
docker run -p 9000:9000 --link medusa-db:db \
  -e DATABASE_URL=postgres://postgres:pass@db:5432/medusa \
  medusa-backend`}
            </pre>
        </div>
      )}
    </div>
  );
};

export default SOP;