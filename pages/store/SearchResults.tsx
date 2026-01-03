
import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { searchProducts } from '../../utils/searchLogic';
import { SortAsc, Search as SearchIcon } from 'lucide-react';
import { SORT_OPTIONS } from '../../constants';
import Highlighter from '../../components/Shared/Highlighter';

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const sortParam = searchParams.get('sort') || 'relevance';
  
  const { products } = useStore();

  // Core Search Logic
  const results = useMemo(() => {
    let matches = searchProducts(products, query);

    // Sorting
    return matches.sort((a, b) => {
      const pA = a.variants[0].prices[0].amount;
      const pB = b.variants[0].prices[0].amount;
      switch (sortParam) {
        case 'price_asc': return pA - pB;
        case 'price_desc': return pB - pA;
        case 'newest': return b.id.localeCompare(a.id);
        case 'relevance': default: return 0; // Already scored in searchProducts
      }
    });
  }, [products, query, sortParam]);

  return (
    <div className="bg-brand-ivory min-h-screen pb-20">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-20 z-10">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-widest mb-1">
              <Link to="/" className="hover:text-brand-primary">Home</Link> / Search
            </div>
            <h1 className="text-xl md:text-2xl font-serif text-slate-900">
              Results for <span className="text-brand-primary italic">"{query}"</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">{results.length} products found</p>
          </div>
          
          {/* Controls */}
          {results.length > 0 && (
            <div className="flex gap-4">
              <div className="relative">
                 <select 
                    value={sortParam} 
                    onChange={(e) => setSearchParams(prev => { prev.set('sort', e.target.value); return prev; })}
                    className="appearance-none pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-primary cursor-pointer"
                 >
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                 </select>
                 <SortAsc size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 animate-slide-up">
            {results.map(product => {
                const price = product.variants[0]?.prices[0]?.amount / 100 || 0;
                // Safe access for tags
                const fabric = product.tags?.find(t => t.value.startsWith('Fabric:'))?.value.split(':')[1];

                return (
                  <Link to={`/product/${product.id}`} key={product.id} className="group block">
                      <div className="relative aspect-[3/4] bg-slate-100 mb-3 overflow-hidden rounded-sm">
                          <img 
                              src={product.thumbnail} 
                              alt={product.title} 
                              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                              <button className="w-full bg-white text-brand-primary text-xs uppercase font-bold py-3 shadow-lg hover:bg-brand-primary hover:text-white transition-colors">
                                  Quick View
                              </button>
                          </div>
                      </div>
                      <h3 className="text-sm font-serif text-slate-900 group-hover:text-brand-primary truncate">
                        <Highlighter text={product.title} highlight={query} />
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                          <span className="text-sm font-bold text-slate-800">₹{price.toLocaleString()}</span>
                      </div>
                      {fabric && (
                        <p className="text-[10px] text-slate-500 uppercase mt-1">
                            <Highlighter text={fabric} highlight={query} />
                        </p>
                      )}
                  </Link>
                );
            })}
          </div>
        ) : (
          /* NO RESULTS UX */
          <div className="max-w-2xl mx-auto text-center py-20 animate-fade-in">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                <SearchIcon size={32} />
             </div>
             <h2 className="text-3xl font-serif text-slate-800 mb-4">No matches found</h2>
             <p className="text-slate-500 mb-8">
               We couldn't find any products matching "{query}". <br/>
               Our catalog is updated daily. Try checking for specific terms like "Red", "Silk", or "Banarasi".
             </p>
             
             <div className="bg-white p-6 rounded-xl border border-slate-200 text-left">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Popular Collections</h3>
                <div className="flex flex-wrap gap-3">
                   <Link to="/catalog?cat=women-sarees" className="px-4 py-2 bg-slate-50 hover:bg-brand-primary hover:text-white transition-colors rounded-lg text-sm font-medium">Sarees</Link>
                   <Link to="/catalog?cat=lehengas" className="px-4 py-2 bg-slate-50 hover:bg-brand-primary hover:text-white transition-colors rounded-lg text-sm font-medium">Lehengas</Link>
                   <Link to="/catalog?cat=sherwanis" className="px-4 py-2 bg-slate-50 hover:bg-brand-primary hover:text-white transition-colors rounded-lg text-sm font-medium">Sherwanis</Link>
                   <Link to="/catalog" className="px-4 py-2 bg-slate-50 hover:bg-brand-primary hover:text-white transition-colors rounded-lg text-sm font-medium">View All Products</Link>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
