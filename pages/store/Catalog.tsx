import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShoppingCart, Filter } from 'lucide-react';

const Catalog: React.FC = () => {
  const { products, addToCart, isLoading } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Medusa uses 'collection_id' or tags, assuming tags for simplified category filtering here
  // or checking title/description keywords if no collections defined
  const categories = ['All', 'Sarees', 'Men', 'Kids'];

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return products;
    // Simple client side filter based on dummy mapping or handle
    // In production, use medusa.products.list({ collection_id: ... })
    return products.filter(p => 
      p.tags?.some(t => t.value === selectedCategory) || 
      p.title.includes(selectedCategory)
    );
  }, [products, selectedCategory]);

  const handleAdd = (productId: string, variantId: string) => {
    addToCart(variantId, 1);
  };

  if (isLoading && products.length === 0) return <div className="p-10 text-center">Loading Catalog...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0 space-y-8">
          <div>
            <h3 className="font-bold text-slate-800 mb-4 flex items-center">
              <Filter size={18} className="mr-2" /> Filters
            </h3>
            <div className="space-y-2">
                {categories.map(cat => (
                  <label key={cat} className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="category" 
                      className="text-emerald-600 focus:ring-emerald-500"
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                    />
                    <span className="text-sm text-slate-700">{cat}</span>
                  </label>
                ))}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => {
                // Get lowest price from variants
                const price = product.variants[0]?.prices[0]?.amount / 100 || 0;
                
                return (
                  <div key={product.id} className="bg-white border border-slate-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-[3/4] bg-slate-100 relative group">
                      <img 
                        src={product.thumbnail || 'https://via.placeholder.com/400'} 
                        alt={product.title} 
                        className="w-full h-full object-cover"
                      />
                      <button 
                        onClick={() => handleAdd(product.id, product.variants[0].id)}
                        className="absolute bottom-4 right-4 bg-white text-emerald-900 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all hover:bg-emerald-900 hover:text-white"
                      >
                        <ShoppingCart size={20} />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-800 mb-2 truncate" title={product.title}>{product.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-emerald-700">₹{price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;