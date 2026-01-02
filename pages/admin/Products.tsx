import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Plus, Upload, MoreVertical, Search, FileDown, Copy, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { CSV_TEMPLATES } from '../../constants';
import { Product } from '../../types';

const Products: React.FC = () => {
  const { products, addProduct, bulkImportProducts } = useStore();
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [activeTemplate, setActiveTemplate] = useState<'master' | 'saree' | 'lehenga' | 'mens'>('master');
  
  const handleBulkUpload = () => {
    // Advanced Parsing Logic for "Strict" Attributes
    const rows = importText.split('\n').filter(r => r.trim() !== '');
    if(rows.length < 2) return;

    const headers = rows[0].split(',').map(h => h.trim());
    
    // Parse Rows
    const data = rows.slice(1).map(row => {
        // Handle CSV commas inside quotes if needed (simplified here)
        const cols = row.split(','); 
        const productObj: any = {};
        
        headers.forEach((header, index) => {
           productObj[header] = cols[index]?.trim();
        });

        // --- DATA TRANSFORMATION FOR MEDUSA ---
        // 1. Core Fields
        const transformed: any = {
            title: productObj['Title'],
            sku: `SKU-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, // Auto-gen SKU if missing
            price: productObj['Price'],
            stock: productObj['Stock'] || 1,
            thumbnail: productObj['Image URL'],
            handle: productObj['Handle'] || productObj['Title'].toLowerCase().replace(/ /g, '-')
        };

        // 2. Generate Tags (Key:Value) from Filter Columns
        // Expanded list of Tag Fields based on Attribute Dictionary
        const tagFields = [
            'Category', 'Fabric', 'Occasion', 'Color', 'Work Type', 
            'Border', 'Blouse', 'Lehenga Type', 'Fit', 'Sleeve', 'Set Type'
        ];
        transformed.tags = [];
        tagFields.forEach(field => {
            if (productObj[field]) {
                // E.g. Tag = "Fabric:Silk"
                transformed.tags.push({ id: `tag_${Math.random()}`, value: `${field}:${productObj[field]}` });
            }
        });

        // 3. Generate Metadata from specific detail columns
        // Expanded list of Metadata Fields
        const metaFields = [
            'Care Instructions', 'Dispatch Time', 'Return Eligible', 'Description',
            'Saree Length', 'Blouse Included', 'Dupatta', 'Waist Range'
        ];
        transformed.metadata = {};
        metaFields.forEach(field => {
             if (productObj[field]) {
                 transformed.metadata[field] = productObj[field];
             }
        });

        return transformed;
    });
    
    bulkImportProducts(data);
    setUploadModalOpen(false);
    setImportText('');
    alert(`Successfully processed ${data.length} products with attributes.`);
  };

  const downloadTemplate = () => {
     const csvContent = CSV_TEMPLATES[activeTemplate];
     const blob = new Blob([csvContent], { type: 'text/csv' });
     const url = window.URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `vaibava_${activeTemplate}_template.csv`;
     a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
           <h2 className="text-xl font-bold text-slate-800">Products & Inventory</h2>
           <p className="text-sm text-slate-500">Manage catalog with AJIO-style attributes.</p>
        </div>
        <div className="flex gap-3">
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
              <th className="px-6 py-4">Attributes (Tags)</th>
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
                
                // Extract useful tags for display
                const fabricTag = product.tags?.find(t => t.value.startsWith('Fabric:'))?.value.split(':')[1];
                const catTag = product.tags?.find(t => t.value.startsWith('Category:'))?.value.split(':')[1];
                
                return (
              <tr key={product.id} className="hover:bg-slate-50 group">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <img src={product.thumbnail} alt="" className="w-10 h-10 rounded object-cover bg-slate-200" />
                    <div>
                      <div className="font-medium text-slate-900">{product.title}</div>
                      <div className="text-xs text-slate-500 font-mono">{sku}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3">
                   <div className="flex gap-2 flex-wrap max-w-xs">
                     {catTag && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] uppercase font-bold">{catTag}</span>}
                     {fabricTag && <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">{fabricTag}</span>}
                     {product.tags?.length ? <span className="text-[10px] text-slate-400">+{product.tags.length - (catTag ? 1:0) - (fabricTag ? 1:0)} more</span> : '-'}
                   </div>
                </td>
                <td className="px-6 py-3 font-medium">₹{price.toLocaleString()}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stock < 10 ? 'bg-red-500' : 'bg-green-500'}`}></span>
                    {stock}
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">Bulk Product Import</h3>
                <button onClick={() => setUploadModalOpen(false)}><X className="text-slate-400 hover:text-slate-600" size={24} /></button>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                <h4 className="text-sm font-bold text-slate-700 mb-2">1. Download Template</h4>
                <div className="flex gap-2">
                    {(['master', 'saree', 'lehenga', 'mens'] as const).map(t => (
                        <button 
                            key={t}
                            onClick={() => setActiveTemplate(t)}
                            className={`px-3 py-1 text-xs rounded border uppercase font-medium ${activeTemplate === t ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                    <code className="text-[10px] text-slate-500 font-mono bg-white p-2 rounded border w-3/4 overflow-x-auto whitespace-nowrap">
                        {CSV_TEMPLATES[activeTemplate].substring(0, 60)}...
                    </code>
                    <button onClick={downloadTemplate} className="text-emerald-600 text-sm font-bold hover:underline flex items-center gap-1">
                        <FileDown size={14} /> Download CSV
                    </button>
                </div>
            </div>

            <h4 className="text-sm font-bold text-slate-700 mb-2">2. Paste Data</h4>
            <p className="text-xs text-slate-500 mb-2">System will automatically create Tags for Fabric, Color, Occasion etc.</p>
            <textarea 
                className="w-full h-40 border border-slate-300 rounded-lg p-3 font-mono text-xs mb-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder={`Handle,Title,Category,Price,Stock,Image URL,Fabric,Occasion,Color,Work Type,Care Instructions\nred-saree-01,Red Silk Saree,Sarees,12000,5,https://...,Silk,Wedding,Red,Zari,Dry Clean Only`}
                value={importText}
                onChange={e => setImportText(e.target.value)}
            ></textarea>

            <div className="flex gap-3 justify-end border-t pt-4">
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