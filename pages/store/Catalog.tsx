import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShoppingCart, Filter, ChevronDown, ChevronRight, X, ChevronUp } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { CATEGORY_HIERARCHY, ATTRIBUTE_DICTIONARY } from '../../constants';

const Catalog: React.FC = () => {
  const { products, isLoading } = useStore();
  const [searchParams] = useSearchParams();
  const activeCatSlug = searchParams.get('cat') || 'all';

  // State for Faceted Filters
  // Structure: { "Fabric": ["Silk", "Cotton"], "Color": ["Red"] }
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Collapse state for sidebar sections
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);

  // Reset filters when category changes
  useEffect(() => {
    setActiveFilters({});
  }, [activeCatSlug]);

  // --- FILTER LOGIC ---
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Category Check
      // We look for a tag "Category:Slug" OR fuzzy match on title/tags for demo
      const matchesCategory = activeCatSlug === 'all' || 
          p.tags?.some(t => t.value.toLowerCase().includes(activeCatSlug.split('-')[0])) || 
          p.title.toLowerCase().includes(activeCatSlug.split('-')[0]);

      if (!matchesCategory) return false;

      // 2. Faceted Attribute Check
      // Logic: For each active filter Key (e.g. Fabric), product must have at least one of the selected Values.
      // AND logic between Keys, OR logic between Values of same Key.
      for (const [key, selectedValues] of Object.entries(activeFilters)) {
        if (selectedValues.length === 0) continue;
        
        // Construct tag strings to look for: e.g. "Fabric:Silk"
        const requiredTags = selectedValues.map(val => `${key}:${val}`);
        
        const hasMatch = p.tags?.some(tag => requiredTags.includes(tag.value));
        if (!hasMatch) return false;
      }

      return true;
    });
  }, [products, activeCatSlug, activeFilters]);

  // --- BREADCRUMB ---
  const getBreadcrumb = () => {
    if (activeCatSlug === 'all') return 'All Collections';
    let trail = '';
    CATEGORY_HIERARCHY.forEach(dept => {
      if (dept.slug === activeCatSlug) trail = `${dept.label}`;
      dept.children.forEach(cat => {
        if (cat.slug === activeCatSlug) trail = `${dept.label} / ${cat.label}`;
        cat.children.forEach(sub => {
           if (sub.slug === activeCatSlug) trail = `${dept.label} / ${cat.label} / ${sub.label}`;
        });
      });
    });
    return trail || 'Collection';
  };

  // --- HANDLERS ---
  const toggleFilter = (key: string, value: string) => {
    setActiveFilters(prev => {
      const current = prev[key] || [];
      const updated = current.includes(value) 
        ? current.filter(v => v !== value) 
        : [...current, value];
      
      // Clean up empty arrays
      if (updated.length === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: updated };
    });
  };

  const toggleSection = (label: string) => {
    setCollapsedSections(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  // Determine valid filters for current view
  // Combine 'global' + specific category filters
  const availableFilters = [
    ...ATTRIBUTE_DICTIONARY.global,
    ...(ATTRIBUTE_DICTIONARY[activeCatSlug] || [])
  ];

  if (isLoading && products.length === 0) return (
      <div className="h-screen flex items-center justify-center bg-brand-ivory">
          <div className="text-brand-primary animate-pulse font-serif text-xl tracking-widest">LOADING COLLECTION...</div>
      </div>
  );

  return (
    <div className="bg-brand-ivory min-h-screen">
      
      {/* Catalog Header */}
      <div className="bg-brand-secondary text-brand-ivory py-8 px-4">
         <div className="container mx-auto">
            <div className="text-xs uppercase tracking-widest opacity-60 mb-2 flex items-center gap-2">
                <Link to="/">Home</Link> <ChevronRight size={10} /> <span>{getBreadcrumb()}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif">{getBreadcrumb().split('/').pop()?.trim()}</h1>
         </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        {/* Mobile Filter Toggle */}
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="lg:hidden w-full flex items-center justify-between p-3 border border-slate-300 rounded mb-6 text-sm font-bold uppercase tracking-wide"
        >
          Filters & Sort <Filter size={16} />
        </button>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Filter */}
          <div className={`
             fixed inset-0 z-50 bg-white lg:static lg:bg-transparent lg:w-64 lg:block flex-shrink-0 transition-transform duration-300
             ${isFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
             <div className="h-full overflow-y-auto lg:overflow-visible p-6 lg:p-0 scrollbar-hide">
                <div className="flex justify-between items-center lg:hidden mb-6">
                   <h3 className="font-serif text-xl text-brand-primary">Filters</h3>
                   <button onClick={() => setIsFilterOpen(false)}><X size={24} /></button>
                </div>

                <div className="space-y-6">
                    {/* Category Navigation */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 border-b pb-2">Browse By</h4>
                      <ul className="space-y-2 text-sm text-slate-600">
                         {CATEGORY_HIERARCHY.map(dept => (
                            <li key={dept.id}>
                               <Link to={`/catalog?cat=${dept.slug}`} className={`hover:text-brand-primary block py-1 ${activeCatSlug.includes(dept.slug) ? 'font-bold text-brand-primary' : ''}`}>{dept.label}</Link>
                            </li>
                         ))}
                      </ul>
                    </div>

                    {/* Dynamic Filters */}
                    {availableFilters.map(filterGroup => {
                      const isCollapsed = collapsedSections.includes(filterGroup.label);
                      return (
                        <div key={filterGroup.key} className="border-b border-slate-200 pb-4">
                           <button 
                             onClick={() => toggleSection(filterGroup.label)}
                             className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 py-2"
                           >
                             {filterGroup.label}
                             {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                           </button>
                           
                           {!isCollapsed && (
                             <div className="space-y-2 animate-fade-in">
                                {filterGroup.options?.map(option => (
                                  <label key={option} className="flex items-center space-x-3 cursor-pointer group">
                                    <div className={`w-4 h-4 border flex items-center justify-center transition-colors rounded-sm ${activeFilters[filterGroup.key]?.includes(option) ? 'border-brand-primary bg-brand-primary' : 'border-slate-300'}`}>
                                        {activeFilters[filterGroup.key]?.includes(option) && <div className="w-2 h-2 bg-white"></div>}
                                    </div>
                                    <input 
                                      type="checkbox" 
                                      className="hidden" 
                                      onChange={() => toggleFilter(filterGroup.key, option)} 
                                      checked={activeFilters[filterGroup.key]?.includes(option) || false} 
                                    />
                                    <span className="text-sm text-slate-600 group-hover:text-brand-primary">{option}</span>
                                  </label>
                                ))}
                             </div>
                           )}
                        </div>
                      );
                    })}

                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="lg:hidden w-full bg-brand-primary text-white py-3 uppercase font-bold tracking-widest mt-8"
                    >
                      Show Products
                    </button>
                </div>
             </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <span className="text-sm text-slate-500">{filteredProducts.length} Products</span>
                
                {/* Active Filter Chips */}
                <div className="flex flex-wrap gap-2">
                    {Object.entries(activeFilters).map(([key, values]) => 
                      values.map(val => (
                        <span key={`${key}-${val}`} className="text-xs bg-slate-200 px-3 py-1 rounded-full flex items-center gap-2 text-slate-700">
                          {val} <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => toggleFilter(key, val)} />
                        </span>
                      ))
                    )}
                    {Object.keys(activeFilters).length > 0 && (
                      <button onClick={() => setActiveFilters({})} className="text-xs text-brand-primary underline ml-2">Clear All</button>
                    )}
                </div>

                <button className="hidden lg:flex items-center text-sm text-slate-700 hover:text-brand-primary ml-auto">
                    Sort by: Featured <ChevronDown size={14} className="ml-1" />
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-10">
                {filteredProducts.map(product => {
                  const price = product.variants[0]?.prices[0]?.amount / 100 || 0;
                  // Extract generic Category Tag for display
                  const displayCat = product.tags?.find(t => t.value.startsWith('Category:'))?.value.split(':')[1] || 'Exclusive';
                  
                  return (
                    <Link to={`/product/${product.id}`} key={product.id} className="group block">
                      <div className="relative aspect-[3/4] bg-brand-gray overflow-hidden mb-4">
                        <img 
                          src={product.thumbnail || 'https://via.placeholder.com/400'} 
                          alt={product.title} 
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             <button className="w-full bg-white/90 text-brand-primary text-xs uppercase font-bold py-2 shadow-sm">Quick Add</button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-serif text-brand-primary text-sm md:text-base mb-1 truncate group-hover:text-brand-gold transition-colors">
                            {product.title}
                        </h3>
                        <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wide mb-2">
                            {displayCat}
                        </p>
                        <span className="text-sm md:text-base font-bold text-slate-900">
                            ₹{price.toLocaleString()}
                        </span>
                      </div>
                    </Link>
                  );
                })}
            </div>
            
            {filteredProducts.length === 0 && (
                <div className="py-20 text-center border border-dashed border-slate-300 rounded-xl">
                    <p className="text-xl font-serif text-slate-400 mb-2">No products match your filters.</p>
                    <p className="text-sm text-slate-500">Try removing some filters or browsing a different category.</p>
                    <button onClick={() => setActiveFilters({})} className="mt-6 px-6 py-2 bg-brand-primary text-white rounded uppercase text-xs tracking-widest">Clear Filters</button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;