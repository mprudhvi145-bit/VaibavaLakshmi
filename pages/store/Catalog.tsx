import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Filter, ChevronRight, X, ChevronDown, ChevronUp, SortAsc, LayoutGrid, AlertTriangle } from 'lucide-react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { ATTRIBUTE_DICTIONARY, SORT_OPTIONS } from '../../constants';
import SEOHelper from '../../components/Shared/SEOHelper';
import { findCategoryNode, getBreadcrumbPath } from '../../utils/categoryHelpers';

const Catalog: React.FC = () => {
  const { products, isLoading } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const { category: routeCategory } = useParams<{ category: string }>();
  
  // Prioritize Route Param, then Query Param, then 'all'
  const activeCatSlug = routeCategory || searchParams.get('cat') || 'all';
  const sortParam = searchParams.get('sort') || 'relevance';

  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);

  // --- 1. RESOLVE CATEGORY & BREADCRUMBS ---
  const { categoryInfo, breadcrumbs, isInvalidCategory } = useMemo(() => {
    let info = { label: 'All Collection', slug: 'all', description: 'Explore our complete collection of ethnic elegance.' };
    let crumbs = [{ label: 'Home', path: '/' }, { label: 'All', path: '/catalog' }];
    let invalid = false;
    
    if (activeCatSlug === 'all') {
        return { categoryInfo: info, breadcrumbs: crumbs, isInvalidCategory: false };
    }

    const node = findCategoryNode(activeCatSlug);
    
    if (node) {
        info = { 
            label: node.label, 
            slug: node.slug, 
            description: `Shop the finest ${node.label} at Vaibava Lakshmi. Handpicked for quality and tradition.`
        };
        crumbs = getBreadcrumbPath(activeCatSlug);
    } else {
        // Fallback / Error State
        console.error(`[Catalog] Invalid category accessed: ${activeCatSlug}`);
        invalid = true;
        // Construct a safe fallback UI state
        const fallbackLabel = activeCatSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        info = { label: `"${fallbackLabel}"`, slug: activeCatSlug, description: 'Category not found or archived.' };
        // Do not show a path for invalid category
        crumbs = [{ label: 'Home', path: '/' }];
    }

    return { categoryInfo: info, breadcrumbs: crumbs, isInvalidCategory: invalid };
  }, [activeCatSlug]);

  useEffect(() => {
    setActiveFilters({});
    window.scrollTo(0,0);
  }, [activeCatSlug]);

  // --- 2. FILTER & SORT PRODUCTS ---
  const displayedProducts = useMemo(() => {
    let result = products.filter(p => {
        // Category Match (Loose string match for hierarchy simulation)
        if (activeCatSlug !== 'all') {
            const tags = p.tags?.map(t => t.value.toLowerCase()) || [];
            const isMatch = tags.some(t => t.includes(activeCatSlug)) || p.handle.includes(activeCatSlug.split('-')[0]); 
            if (!isMatch) return false;
        }

        // Attribute Filters
        for (const [key, selectedValues] of Object.entries(activeFilters) as [string, string[]][]) {
            if (selectedValues.length === 0) continue;
            if (key === 'Price') continue; 
            const requiredTags = selectedValues.map(val => `${key}:${val}`.toLowerCase());
            const hasMatch = p.tags?.some(tag => requiredTags.includes(tag.value.toLowerCase()));
            if (!hasMatch) return false;
        }
        return true;
    });

    // Sorting
    return result.sort((a, b) => {
        const pA = a.variants[0].prices[0].amount;
        const pB = b.variants[0].prices[0].amount;
        switch (sortParam) {
            case 'price_asc': return pA - pB;
            case 'price_desc': return pB - pA;
            case 'newest': return b.id.localeCompare(a.id);
            default: return 0;
        }
    });
  }, [products, activeCatSlug, activeFilters, sortParam]);

  // --- 3. HELPER FOR FILTERS ---
  const toggleFilter = (key: string, value: string) => {
    setActiveFilters(prev => {
      const current = prev[key] || [];
      const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
      if (updated.length === 0) { const { [key]: _, ...rest } = prev; return rest; }
      return { ...prev, [key]: updated };
    });
  };

  const availableFilters = useMemo(() => {
     let base = [...ATTRIBUTE_DICTIONARY.global];
     if (activeCatSlug.includes('saree')) base = [...base, ...ATTRIBUTE_DICTIONARY['sarees'] || []];
     if (activeCatSlug.includes('kids')) base = [...base, ...ATTRIBUTE_DICTIONARY['kids'] || []];
     return base.filter((v,i,a)=>a.findIndex(t=>(t.key===v.key))===i);
  }, [activeCatSlug]);

  return (
    <div className="bg-brand-ivory min-h-screen">
      <SEOHelper 
        title={categoryInfo.label} 
        description={categoryInfo.description} 
        type="collection"
        breadcrumbs={breadcrumbs}
      />
      
      {/* CATEGORY BANNER */}
      <div className="relative h-48 md:h-72 bg-brand-secondary overflow-hidden">
        <img 
            src={`https://source.unsplash.com/random/1600x600/?${categoryInfo.label},fashion`} 
            className="w-full h-full object-cover opacity-50"
            alt={categoryInfo.label}
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
            <h1 className="text-3xl md:text-5xl font-serif text-white mb-2">{categoryInfo.label}</h1>
            <p className="text-white/80 text-sm max-w-xl">{categoryInfo.description}</p>
            {isInvalidCategory && (
                <div className="mt-4 flex items-center gap-2 bg-amber-500/20 text-amber-200 px-4 py-2 rounded-full border border-amber-500/50 backdrop-blur-sm text-sm">
                    <AlertTriangle size={16} /> 
                    <span>Category not found in catalog</span>
                </div>
            )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        {/* BREADCRUMBS */}
        <div className="flex items-center text-xs text-slate-500 mb-6 uppercase tracking-wider overflow-x-auto whitespace-nowrap">
            {breadcrumbs.map((crumb, idx) => (
                <div key={idx} className="flex items-center">
                    {idx > 0 && <ChevronRight size={12} className="mx-2 text-slate-400" />}
                    <Link to={crumb.path} className={`hover:text-brand-primary ${idx === breadcrumbs.length - 1 ? 'text-brand-primary font-bold' : ''}`}>
                        {crumb.label}
                    </Link>
                </div>
            ))}
        </div>

        {/* MOBILE CONTROLS */}
        <div className="lg:hidden grid grid-cols-2 gap-4 mb-6 sticky top-20 z-30 bg-brand-ivory py-2">
            <button 
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center justify-center py-3 border border-slate-300 bg-white text-slate-700 text-sm font-bold uppercase tracking-wide"
            >
                Filters <Filter size={14} className="ml-2"/>
            </button>
            <div className="relative">
                <select 
                    value={sortParam} 
                    onChange={e => setSearchParams(prev => { prev.set('sort', e.target.value); return prev; })}
                    className="w-full h-full appearance-none py-3 pl-4 border border-slate-300 bg-white text-slate-700 text-sm font-bold uppercase tracking-wide"
                >
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <SortAsc size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
            </div>
        </div>

        <div className="flex gap-8 items-start">
            
            {/* DESKTOP SIDEBAR FILTERS */}
            <aside className={`
                fixed inset-0 z-50 bg-white lg:static lg:bg-transparent lg:w-64 lg:block flex-shrink-0 transition-transform duration-300
                ${isFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-full overflow-y-auto lg:overflow-visible p-6 lg:p-0">
                    <div className="flex justify-between items-center lg:hidden mb-6 border-b pb-4">
                        <span className="font-serif text-xl">Refine Selection</span>
                        <button onClick={() => setIsFilterOpen(false)}><X size={24} /></button>
                    </div>

                    <div className="space-y-6">
                        {availableFilters.map(filter => {
                            const isCollapsed = collapsedSections.includes(filter.key);
                            return (
                                <div key={filter.key} className="border-b border-slate-200 pb-4">
                                    <button 
                                        onClick={() => setCollapsedSections(prev => isCollapsed ? prev.filter(k => k !== filter.key) : [...prev, filter.key])}
                                        className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-800 mb-3"
                                    >
                                        {filter.label}
                                        {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                    </button>
                                    {!isCollapsed && (
                                        <div className="space-y-2">
                                            {filter.options?.map(opt => (
                                                <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                                    <div className={`w-4 h-4 border flex items-center justify-center rounded-sm ${activeFilters[filter.key]?.includes(opt) ? 'bg-brand-primary border-brand-primary' : 'border-slate-300'}`}>
                                                        {activeFilters[filter.key]?.includes(opt) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                    </div>
                                                    <input 
                                                        type="checkbox" 
                                                        className="hidden" 
                                                        onChange={() => toggleFilter(filter.key, opt)} 
                                                        checked={activeFilters[filter.key]?.includes(opt) || false} 
                                                    />
                                                    <span className={`text-sm group-hover:text-brand-primary ${activeFilters[filter.key]?.includes(opt) ? 'text-brand-primary font-medium' : 'text-slate-600'}`}>
                                                        {opt}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    
                    <button 
                        onClick={() => setIsFilterOpen(false)} 
                        className="lg:hidden w-full mt-8 bg-brand-primary text-white py-4 uppercase font-bold sticky bottom-0"
                    >
                        Show Results
                    </button>
                </div>
            </aside>

            {/* PRODUCT GRID */}
            <div className="flex-1">
                {/* Desktop Sort */}
                <div className="hidden lg:flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                    <span className="text-sm font-medium text-slate-500">Showing {displayedProducts.length} Items</span>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">Sort By</span>
                        <select 
                            value={sortParam} 
                            onChange={e => setSearchParams(prev => { prev.set('sort', e.target.value); return prev; })}
                            className="text-sm font-bold text-slate-800 bg-transparent border-none cursor-pointer focus:ring-0"
                        >
                            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* Active Filter Chips */}
                {Object.keys(activeFilters).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {Object.entries(activeFilters).map(([key, vals]) => 
                            vals.map(val => (
                                <button key={`${key}-${val}`} onClick={() => toggleFilter(key, val)} className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-300 rounded-full text-xs text-slate-600 hover:border-red-500 hover:text-red-500">
                                    {val} <X size={12} />
                                </button>
                            ))
                        )}
                        <button onClick={() => setActiveFilters({})} className="text-xs text-brand-primary underline ml-2">Clear All</button>
                    </div>
                )}

                {/* Grid */}
                {displayedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
                        {displayedProducts.map(product => {
                             const price = product.variants[0]?.prices[0]?.amount / 100 || 0;
                             const badge = product.metadata?.['Badge'];
                             return (
                                <Link to={`/product/${product.id}`} key={product.id} className="group block">
                                    <div className="relative aspect-[3/4] bg-slate-100 mb-3 overflow-hidden">
                                        <img 
                                            src={product.thumbnail} 
                                            alt={product.title} 
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                            loading="lazy"
                                        />
                                        {badge && (
                                            <span className="absolute top-2 left-2 bg-white/90 text-[10px] font-bold uppercase px-2 py-1 tracking-widest text-brand-primary">
                                                {badge}
                                            </span>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                            <button className="w-full bg-white text-brand-primary text-xs uppercase font-bold py-3 shadow-lg hover:bg-brand-primary hover:text-white transition-colors">
                                                Quick View
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-serif text-slate-900 group-hover:text-brand-primary truncate">{product.title}</h3>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-sm font-bold text-slate-800">₹{price.toLocaleString()}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-1 truncate">
                                        {product.tags?.find(t => t.value.startsWith('Fabric'))?.value.split(':')[1] || 'Premium Quality'}
                                    </p>
                                </Link>
                             );
                        })}
                    </div>
                ) : (
                    <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-lg">
                        <p className="text-xl font-serif text-slate-400 mb-2">No products found.</p>
                        <p className="text-sm text-slate-500">Try adjusting your filters.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;