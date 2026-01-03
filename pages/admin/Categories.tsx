import React, { useEffect, useState } from 'react';
import { AdminService } from '../../services/admin.service';
import { FolderTree, Lock, ChevronRight, Tag } from 'lucide-react';

const Categories: React.FC = () => {
  const [tree, setTree] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await AdminService.getCategories();
      setTree(data);
    };
    load();
  }, []);

  const renderNode = (node: any, level = 0) => (
    <div key={node.id} className="mb-2">
      <div 
        className={`flex items-center gap-3 p-3 rounded-lg border ${
          level === 0 ? 'bg-slate-50 border-slate-300 font-bold text-lg' : 
          level === 1 ? 'bg-white border-slate-100 ml-6 text-base' : 
          'bg-white border-dashed border-slate-200 ml-12 text-sm text-slate-600'
        }`}
      >
        {level === 0 ? <FolderTree size={20} className="text-slate-800" /> : <ChevronRight size={16} className="text-slate-400" />}
        <span className="flex-1">{node.label}</span>
        <code className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-emerald-700">{node.slug}</code>
        <span title="Locked by Governance">
          <Lock size={14} className="text-slate-300" />
        </span>
      </div>
      
      {node.children && (
        <div className="mt-2 space-y-2">
          {node.children.map((child: any) => renderNode(child, level + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Category Governance</h1>
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex gap-3 text-amber-900 text-sm">
          <Lock className="shrink-0 mt-0.5" size={18} />
          <p>
            <strong>Strict Taxonomy Mode:</strong> You cannot create or delete categories from the Admin Panel. 
            When importing products, you must use the exact <code>slug</code> codes shown below in your CSV <strong>Category</strong> column.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {tree.map(root => renderNode(root))}
      </div>

      <div className="mt-12 p-6 bg-slate-800 text-white rounded-xl">
        <h3 className="font-bold flex items-center gap-2 mb-4">
          <Tag size={20} /> Allowed Filters per Category
        </h3>
        <p className="text-sm opacity-80 mb-4">Ensures your filters sidebar works correctly on the storefront.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
           <div className="bg-white/10 p-3 rounded">
             <strong className="block text-emerald-400 mb-1">women-sarees</strong>
             Fabric, Occasion, Color, Work Type, Price
           </div>
           <div className="bg-white/10 p-3 rounded">
             <strong className="block text-emerald-400 mb-1">lehengas</strong>
             Fabric, Occasion, Color, Price
           </div>
           <div className="bg-white/10 p-3 rounded">
             <strong className="block text-emerald-400 mb-1">men-ethnic</strong>
             Fabric, Size, Color, Price
           </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;