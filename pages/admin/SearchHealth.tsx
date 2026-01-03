
import React, { useState } from 'react';
import { AdminService } from '../../services/admin.service';
import { Search, Check, XCircle } from 'lucide-react';
import { SYNONYM_MAP } from '../../utils/searchConfig';

const SearchHealth: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    const data = await AdminService.testSearch(query);
    setResults(data.results || []);
    setSearched(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Search Engine Diagnostics</h1>
        <p className="text-sm text-slate-500">Test how customers find your products.</p>
      </div>

      {/* Test Sandbox */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <form onSubmit={handleTest} className="flex gap-4">
          <input 
            className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-900 outline-none"
            placeholder="Enter a test term (e.g., 'Red Silk', 'Haldi')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold">Test</button>
        </form>

        {searched && (
          <div className="mt-6 border-t pt-4">
             <div className="flex items-center gap-2 mb-4">
                {results.length > 0 ? <Check className="text-green-500"/> : <XCircle className="text-red-500"/>}
                <span className="font-bold text-sm">Found {results.length} matches</span>
             </div>
             <div className="space-y-2 max-h-60 overflow-y-auto">
                {results.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-200">
                    <img src={p.thumbnail} className="w-8 h-8 rounded object-cover" />
                    <span className="text-sm font-medium">{p.title}</span>
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">{p.handle}</span>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* Synonyms Config Viewer */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
         <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Search size={18} /> Active Synonym Dictionary
         </h3>
         <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(SYNONYM_MAP).map(([key, val]) => (
                <div key={key} className="bg-white px-3 py-2 rounded border border-slate-200 text-sm">
                    <span className="text-slate-500">{key}</span>
                    <span className="mx-2">→</span>
                    <span className="font-bold text-slate-800">{val}</span>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default SearchHealth;
