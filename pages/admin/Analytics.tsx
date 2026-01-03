
import React, { useEffect, useState } from 'react';
import { AdminService } from '../../services/admin.service';
import { TrendingUp, Search, Eye, ShoppingCart, BarChart2 } from 'lucide-react';

const Analytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
        const stats = await AdminService.getAnalytics();
        setData(stats);
    } catch (e) {
        console.error("Failed to load analytics");
    } finally {
        setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Loading Intelligence...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-slate-800">Store Analytics</h2>
           <p className="text-sm text-slate-500">Internal tracking of user behavior (No PII).</p>
        </div>
        <button onClick={loadData} className="text-sm text-brand-primary underline">Refresh</button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Search size={24} /></div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Searches</p>
                <h3 className="text-2xl font-bold text-slate-800">{data.overview.searches.toLocaleString()}</h3>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Eye size={24} /></div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Views</p>
                <h3 className="text-2xl font-bold text-slate-800">{data.overview.views.toLocaleString()}</h3>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg"><ShoppingCart size={24} /></div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Add to Carts</p>
                <h3 className="text-2xl font-bold text-slate-800">{data.overview.carts.toLocaleString()}</h3>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Searches */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp size={18}/> Top Searches</h3>
            <div className="space-y-3">
                {data.topSearches.length > 0 ? data.topSearches.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center pb-2 border-b border-slate-50 last:border-0">
                        <span className="text-sm font-medium text-slate-700">{item.payload}</span>
                        <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{item.count}</span>
                    </div>
                )) : (
                    <div className="text-center text-slate-400 text-sm py-4">No data yet</div>
                )}
            </div>
        </div>

        {/* Top Products */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><BarChart2 size={18}/> Most Viewed Products</h3>
            <div className="space-y-3">
                {data.topProducts.length > 0 ? data.topProducts.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center pb-2 border-b border-slate-50 last:border-0">
                        <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{item.payload}</span>
                        <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{item.count}</span>
                    </div>
                )) : (
                    <div className="text-center text-slate-400 text-sm py-4">No data yet</div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
