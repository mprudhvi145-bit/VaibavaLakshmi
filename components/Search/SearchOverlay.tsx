
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ChevronRight, TrendingUp, History } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { getSearchSuggestions, trackSearchQuery, getPopularSearches } from '../../utils/searchLogic';
import Highlighter from '../Shared/Highlighter';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const { products } = useStore();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ReturnType<typeof getSearchSuggestions> | null>(null);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);

  // Auto-focus, Body Scroll Lock, and Load Popular
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 100);
      setPopularSearches(getPopularSearches());
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Handle Typing
  useEffect(() => {
    if (query.length > 1) {
      const timer = setTimeout(() => {
        setSuggestions(getSearchSuggestions(products, query));
      }, 200); // 200ms Debounce
      return () => clearTimeout(timer);
    } else {
      setSuggestions(null);
    }
  }, [query, products]);

  const handleSearch = (e?: React.FormEvent, term?: string) => {
    e?.preventDefault();
    const finalQuery = term || query;
    if (!finalQuery.trim()) return;
    
    // Tracking
    trackSearchQuery(finalQuery);

    onClose();
    navigate(`/search?q=${encodeURIComponent(finalQuery)}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-brand-ivory/95 backdrop-blur-sm animate-fade-in flex flex-col">
      {/* Header / Input Area */}
      <div className="bg-white border-b border-brand-gold/20 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center gap-4">
          <Search className="text-brand-primary" size={24} />
          <form onSubmit={handleSearch} className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sarees, kurtas, lehengas..."
              className="w-full text-lg md:text-2xl font-serif text-slate-800 bg-transparent placeholder:text-slate-300 focus:outline-none"
            />
          </form>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Results / Suggestions Area */}
      <div className="flex-1 overflow-y-auto container mx-auto px-4 py-8">
        
        {/* State: Typing but no results yet */}
        {!suggestions && (
           <div className="space-y-8 animate-slide-up">
             {/* Popular Searches */}
             <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <TrendingUp size={14} /> Popular Now
                </h3>
                <div className="flex flex-wrap gap-3">
                  {popularSearches.length > 0 ? popularSearches.map(term => (
                    <button 
                      key={term}
                      onClick={() => handleSearch(undefined, term)}
                      className="px-4 py-2 border border-slate-200 bg-white rounded-full text-sm text-slate-600 hover:border-brand-primary hover:text-brand-primary transition-colors"
                    >
                      {term}
                    </button>
                  )) : (
                    <span className="text-slate-400 italic text-sm">No recent searches. Try 'Kanchipuram'.</span>
                  )}
                </div>
             </div>

             {/* Quick Links / Suggestions */}
             <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Browse by Category</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Sarees', 'Lehengas', 'Sherwanis', 'Kurtas'].map(cat => (
                        <button key={cat} onClick={() => { navigate(`/catalog?cat=${cat.toLowerCase()}`); onClose(); }} className="p-4 bg-brand-primary/5 hover:bg-brand-primary/10 rounded-lg text-left transition-colors">
                            <span className="block font-serif text-brand-primary text-lg">{cat}</span>
                        </button>
                    ))}
                </div>
             </div>
           </div>
        )}

        {/* State: Results Found (Typeahead) */}
        {suggestions && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-slide-up">
            
            {/* Column 1: Categories & Quick Links */}
            <div>
              {suggestions.categories.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Matching Collections</h3>
                  <div className="space-y-2">
                    {suggestions.categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => { navigate(`/catalog?cat=${cat.toLowerCase().replace(' ', '-')}`); onClose(); }}
                        className="block w-full text-left py-2 text-lg font-serif text-brand-primary hover:text-brand-gold transition-colors"
                      >
                        <Highlighter text={cat.replace(/-/g, ' ')} highlight={query} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <button 
                onClick={(e) => handleSearch(e)}
                className="text-sm font-bold text-slate-800 underline hover:text-brand-primary"
              >
                View all {suggestions.totalCount} results for "{query}"
              </button>
            </div>

            {/* Column 2: Product Previews */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Top Products</h3>
              {suggestions.topProducts.length > 0 ? (
                <div className="space-y-4">
                  {suggestions.topProducts.map(product => (
                    <button 
                      key={product.id}
                      onClick={() => { navigate(`/product/${product.id}`); onClose(); }}
                      className="flex items-center gap-4 w-full text-left group hover:bg-white p-2 rounded-lg transition-colors"
                    >
                      <img src={product.thumbnail} alt={product.title} className="w-16 h-20 object-cover rounded bg-slate-100" />
                      <div>
                        <h4 className="font-serif text-slate-800 group-hover:text-brand-primary transition-colors">
                            <Highlighter text={product.title} highlight={query} />
                        </h4>
                        <p className="text-sm font-medium text-slate-500">₹{(product.variants[0].prices[0].amount / 100).toLocaleString()}</p>
                      </div>
                      <ChevronRight className="ml-auto text-slate-300 group-hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-all" size={20} />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic">No direct product matches.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;
