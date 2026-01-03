
import React, { useEffect, useState } from 'react';
import { AdminService } from '../../services/admin.service';
import { Activity, Server, Database, AlertTriangle, CheckCircle, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const health = await AdminService.getHealth();
    setStats(health);
    setLoading(false);
  };

  if (loading) return <div className="p-8 text-center">Connecting to Backend System...</div>;

  const isSystemHealthy = stats?.status === 'ok';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Operator Dashboard</h1>
          <p className="text-sm text-slate-500">System Overview & Health</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white border rounded-full text-xs font-medium">
          <div className={`w-2 h-2 rounded-full ${isSystemHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {isSystemHealthy ? 'Backend Online' : 'Backend Offline'}
        </div>
      </div>

      {/* KPI Cards (Mobile Friendly Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border shadow-sm border-l-4 border-l-brand-primary">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Inventory</p>
              <h3 className="text-3xl font-mono font-bold text-slate-800 mt-2">{stats?.catalog_size || 0}</h3>
              <p className="text-xs text-slate-500 mt-1">Products synced</p>
            </div>
            <Database className="text-brand-primary/20" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Status</p>
              <h3 className="text-3xl font-bold text-emerald-600 mt-2">Healthy</h3>
              <p className="text-xs text-slate-500 mt-1">Uptime: {Math.floor(stats?.uptime / 60)} mins</p>
            </div>
            <Activity className="text-emerald-500/20" size={32} />
          </div>
        </div>

        <Link to="/admin/products" className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border shadow-sm text-white hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Action</p>
              <h3 className="text-xl font-bold mt-2 flex items-center gap-2"><UploadCloud size={20}/> Import Data</h3>
              <p className="text-xs text-slate-300 mt-2">Upload CSV to update catalog</p>
            </div>
            <Server className="text-white/20" size={32} />
          </div>
        </Link>
      </div>

      {/* Operator Safety Guidelines */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-amber-800 flex items-center gap-2 mb-4">
          <AlertTriangle size={20} /> Operator Safety Rules
        </h3>
        <ul className="space-y-3 text-sm text-amber-900">
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="mt-0.5 opacity-50"/>
            <span><strong>Read-Only Dashboard:</strong> You cannot edit products directly here to prevent data corruption. Always use the CSV Import.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="mt-0.5 opacity-50"/>
            <span><strong>Category Lock:</strong> Do not invent new categories in the CSV. Use only the ones listed in the <em>Categories</em> tab.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="mt-0.5 opacity-50"/>
            <span><strong>Backup:</strong> The system creates an automated snapshot before every bulk import.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
