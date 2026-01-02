import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Plus, Upload, MoreVertical, Search, FileDown, Copy } from 'lucide-react';

const Products: React.FC = () => {
  const { products, addProduct, bulkImportProducts } = useStore();
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  
  const handleBulkUpload = () => {
    // Basic CSV parse simulation
    const rows = importText.split('\n').filter(r => r.trim() !== '');
    // Skip header
    const data = rows.slice(1).map(row => {
        const cols = row.split(',');
        return { name: cols[0], sku: cols[1], price: cols[2], stock: cols[3], category: cols[4] };
    });
    
    bulkImportProducts(data);
    setUploadModalOpen(false);
    setImportText('');
    alert(`Successfully imported ${data.length} products.`);
  };

  const templateCSV = "Name,SKU,Price,Stock,Category\nSilk Saree,VL-SK-999,12000,10,Sarees";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">Products & Inventory</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => {
                const blob = new Blob([templateCSV], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'product_template.csv';
                a.click();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-700"
          >
             <FileDown size={16} /> Template
          </button>
          <button 
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-700"
          >
             <Upload size={16} /> Bulk Import
          </button>
          <button 
            onClick={addProduct}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm"
          >
             <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, SKU, or category..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-600 text-sm">
          <option>All Categories</option>
          <option>Sarees</option>
          <option>Men</option>
          <option>Kids</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map(product => {
                const price = product.variants?.[0]?.prices?.[0]?.amount 
                    ? product.variants[0].prices[0].amount / 100 
                    : 0;
                const stock = product.variants?.reduce((sum, v) => sum + v.inventory_quantity, 0) || 0;
                const sku = product.variants?.[0]?.sku || '-';
                const category = product.tags?.[0]?.value || '-';
                
                return (
              <tr key={product.id} className="hover:bg-slate-50 group">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <img src={product.thumbnail} alt="" className="w-10 h-10 rounded object-cover bg-slate-200" />
                    <div>
                      <div className="font-medium text-slate-900">{product.title}</div>
                      <div className="text-xs text-slate-500">{category}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3 text-slate-500 font-mono text-xs">{sku}</td>
                <td className="px-6 py-3 font-medium">₹{price.toLocaleString()}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stock < 10 ? 'bg-red-500' : 'bg-green-500'}`}></span>
                    {stock} in stock
                  </div>
                </td>
                <td className="px-6 py-3">
                   <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium">Published</span>
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex justify-end gap-2">
                     <button className="p-1 text-slate-400 hover:text-slate-600" title="Clone">
                       <Copy size={16} />
                     </button>
                     <button className="p-1 text-slate-400 hover:text-slate-600">
                       <MoreVertical size={16} />
                     </button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {/* Import Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Bulk Product Import</h3>
            <p className="text-sm text-slate-500 mb-4">Paste CSV data below (Name, SKU, Price, Stock, Category)</p>
            
            <textarea 
                className="w-full h-40 border border-slate-300 rounded-lg p-3 font-mono text-xs mb-4"
                placeholder={`Silk Saree,VL-01,1000,5,Sarees\nCotton Shirt,VL-02,500,10,Men`}
                value={importText}
                onChange={e => setImportText(e.target.value)}
            ></textarea>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setUploadModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleBulkUpload}
                disabled={!importText}
                className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                Parse & Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;