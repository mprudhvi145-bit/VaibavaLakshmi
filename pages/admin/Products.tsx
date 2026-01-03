
import React, { useState, useEffect } from 'react';
import { AdminService } from '../../services/admin.service';
import { Upload, Search, Download, ShieldAlert, CheckCircle, X, AlertTriangle, FileText, Lock } from 'lucide-react';
import { validateAndImport } from '../../utils/csvImportWorkflow';
import { CSV_TEMPLATES } from '../../constants';
import { useStore } from '../../context/StoreContext';

const Products: React.FC = () => {
  const { user } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importStep, setImportStep] = useState<'input' | 'validating' | 'summary' | 'uploading'>('input');
  
  // CSV State
  const [csvText, setCsvText] = useState('');
  const [validationReport, setValidationReport] = useState<any>(null);

  const canEdit = user?.role === 'owner' || user?.role === 'operator';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    const data = await AdminService.getProducts();
    setProducts(data || []);
    setIsLoading(false);
  };

  // --- CSV WORKFLOW ---
  
  const handleValidate = () => {
    setImportStep('validating');
    // Run Client-Side Validation Logic
    const report = validateAndImport(csvText);
    setValidationReport(report);
    setImportStep('summary');
  };

  const handleCommit = async () => {
    if (!validationReport?.validRows?.length) return;
    setImportStep('uploading');
    try {
      // Send raw text to backend for processing/storage
      await AdminService.importCatalog(csvText);
      alert('Catalog Imported Successfully!');
      setIsImportOpen(false);
      setCsvText('');
      setValidationReport(null);
      setImportStep('input');
      fetchProducts(); // Refresh list
    } catch (e) {
      alert('Server Error: Import Failed');
      setImportStep('summary');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-xl font-bold text-slate-800">Inventory Management</h2>
           <p className="text-sm text-slate-500 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
             {products.length} Products Live
           </p>
        </div>
        
        {canEdit ? (
          <button 
            onClick={() => setIsImportOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95"
          >
             <Upload size={18} /> Update via CSV
          </button>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 bg-slate-100 px-4 py-2 rounded-lg text-sm">
             <Lock size={16} /> Read-Only Mode
          </div>
        )}
      </div>

      {/* Safety Banner */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
        <ShieldAlert className="text-blue-600 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="text-sm font-bold text-blue-800">Safe Mode Active</h4>
          <p className="text-xs text-blue-600">Direct editing is disabled to ensure data integrity. To make changes, update your CSV file and re-import.</p>
        </div>
      </div>

      {/* Product List (Responsive) */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Loading Inventory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">SKU / Handle</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const category = p.tags?.find((t: any) => t.value.startsWith('Category:'))?.value.split(':')[1] || '-';
                  const price = p.variants?.[0]?.prices?.[0]?.amount / 100 || 0;
                  const stock = p.variants?.[0]?.inventory_quantity || 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden border">
                            <img src={p.thumbnail} className="w-full h-full object-cover" alt="" />
                          </div>
                          <span className="font-medium text-slate-900 truncate max-w-[200px]">{p.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 font-mono text-slate-500 text-xs">{p.handle}</td>
                      <td className="px-6 py-3 font-bold text-slate-700">₹{price.toLocaleString()}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${stock < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {stock} Units
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs text-slate-600">
                          {category}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* IMPORT MODAL */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Bulk Product Import</h3>
              <button onClick={() => setIsImportOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              
              {/* STEP 1: INPUT */}
              {importStep === 'input' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm flex gap-3">
                     <FileText size={20} className="shrink-0" />
                     <p>Paste your CSV content below. Ensure headers match the <strong>Master Template</strong> exactly.</p>
                  </div>
                  <textarea 
                    className="w-full h-64 border border-slate-300 rounded-lg p-4 font-mono text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                    placeholder="Handle,Title,Category,Price,Stock..."
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                  />
                  <div className="flex gap-2 justify-end">
                     <button className="text-xs text-slate-500 hover:text-slate-800 font-bold underline" onClick={() => setCsvText(CSV_TEMPLATES.master)}>Load Sample Data</button>
                  </div>
                </div>
              )}

              {/* STEP 2: SUMMARY & ERRORS */}
              {importStep === 'summary' && validationReport && (
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-1 bg-green-50 border border-green-100 p-4 rounded-lg text-center">
                      <h4 className="text-2xl font-bold text-green-700">{validationReport.validRows.length}</h4>
                      <p className="text-xs text-green-600 uppercase font-bold">Valid Products</p>
                    </div>
                    <div className="flex-1 bg-red-50 border border-red-100 p-4 rounded-lg text-center">
                      <h4 className="text-2xl font-bold text-red-700">{validationReport.errors.length}</h4>
                      <p className="text-xs text-red-600 uppercase font-bold">Blocking Errors</p>
                    </div>
                  </div>

                  {validationReport.errors.length > 0 ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="font-bold text-red-800 flex items-center gap-2 mb-2"><AlertTriangle size={18}/> Issues Found</h5>
                      <ul className="text-xs text-red-700 space-y-1 max-h-40 overflow-y-auto pl-4 list-disc">
                        {validationReport.errors.map((e: string, i: number) => <li key={i}>{e}</li>)}
                      </ul>
                      <p className="mt-4 text-xs font-bold text-red-800">Please fix these errors in your CSV and try again.</p>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                      <CheckCircle className="text-green-600" size={24} />
                      <div>
                        <h5 className="font-bold text-green-800">Data Validated</h5>
                        <p className="text-xs text-green-700">Your data is clean and ready to be imported into the backend.</p>
                      </div>
                    </div>
                  )}

                  {validationReport.warnings.length > 0 && (
                     <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-xs font-bold text-amber-800 mb-2">Warnings (Will be imported)</p>
                        <ul className="text-xs text-amber-700 space-y-1 pl-4 list-disc max-h-24 overflow-y-auto">
                            {validationReport.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
                        </ul>
                     </div>
                  )}
                </div>
              )}

              {importStep === 'uploading' && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4"></div>
                  <h4 className="font-bold text-lg text-slate-800">Updating Catalog...</h4>
                  <p className="text-sm text-slate-500">Syncing with database and rebuilding search index.</p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t flex justify-between items-center">
              {importStep === 'input' && (
                <>
                  <button onClick={() => setIsImportOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg">Cancel</button>
                  <button 
                    onClick={handleValidate}
                    disabled={!csvText}
                    className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50"
                  >
                    Validate Data
                  </button>
                </>
              )}
              {importStep === 'summary' && (
                <>
                  <button onClick={() => setImportStep('input')} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg">Back to Edit</button>
                  <button 
                    onClick={handleCommit}
                    disabled={validationReport?.errors.length > 0}
                    className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg"
                  >
                    Import Live
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
