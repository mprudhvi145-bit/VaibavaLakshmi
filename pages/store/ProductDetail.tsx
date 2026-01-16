import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Truck, ShieldCheck, Heart, Share2, Ruler, Clock, RotateCcw, AlertOctagon, ChevronLeft, ChevronRight, X, Maximize2, ZoomIn, Check } from 'lucide-react';
import { Product } from '../../types';
import SEOHelper from '../../components/Shared/SEOHelper';
import Breadcrumb from '../../components/Shared/Breadcrumb';
import { getBreadcrumbPath } from '../../utils/categoryHelpers';

// Color Mapping for UI
const COLOR_MAP: Record<string, string> = {
  Red: '#ef4444', Pink: '#ec4899', Blue: '#3b82f6', Green: '#15803d',
  Yellow: '#eab308', Black: '#171717', White: '#ffffff', Gold: '#D4AF37',
  Silver: '#C0C0C0', Orange: '#f97316', Grey: '#6b7280', Beige: '#f5f5dc',
  Purple: '#9333ea', Teal: '#0d9488', Wine: '#722f37', Cream: '#fef3c7',
  Multi: 'linear-gradient(45deg, red, yellow, blue)'
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, addToCart, isLoading, trackEvent, toggleWishlist, isInWishlist } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  
  // Gallery State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // --- 1. CRITICAL: SCROLL TO TOP ON LOAD ---
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  useEffect(() => {
    if (products.length > 0 && id) {
      const found = products.find(p => p.id === id);
      if (found) {
        setProduct(found);
        setCurrentImageIndex(0); // Reset gallery on product change
        trackEvent('pdp_view', { productId: found.id, name: found.title, category: found.tags?.[0]?.value });
      }
    }
  }, [products, id]);

  // --- KEYBOARD NAVIGATION & SCROLL LOCK ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
    };

    if (isFullscreen) {
      document.body.style.overflow = 'hidden'; // Lock scroll
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = ''; // Unlock scroll
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  // --- HELPERS ---
  const getTagValue = (p: Product | null, key: string) => 
    p?.tags?.find(t => t.value.startsWith(`${key}:`))?.value.split(':')[1];

  // --- GALLERY HELPERS ---
  const images = useMemo(() => {
    if (!product) return [];
    // Fallback to mock gallery if specific images aren't in data model, matching previous behavior
    const imgs = (product as any).images || [product.thumbnail, product.thumbnail, product.thumbnail];
    return imgs.filter(Boolean);
  }, [product]);

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // --- SWIPE LOGIC ---
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) handleNextImage();
    if (isRightSwipe) handlePrevImage();
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  // --- DATA INTEGRITY CHECK ---
  const validationResult = useMemo(() => {
    if (!product) return { isValid: false, missing: [] };
    
    const missingFields: string[] = [];
    if (!product.title) missingFields.push('Title');
    if (!product.thumbnail) missingFields.push('Image');
    
    // Check Price exists
    const hasPrice = product.variants?.[0]?.prices?.[0]?.amount !== undefined;
    if (!hasPrice) missingFields.push('Price');

    // Check Category Tag exists
    const hasCategory = product.tags?.some(t => t.value.startsWith('Category:'));
    if (!hasCategory) missingFields.push('Category');

    return { isValid: missingFields.length === 0, missing: missingFields };
  }, [product]);

  // --- COLOR VARIANTS LOGIC ---
  const siblings = useMemo(() => {
    if (!product || !products.length) return [];
    const cat = getTagValue(product, 'Category');
    const fab = getTagValue(product, 'Fabric');
    const work = getTagValue(product, 'Work Type');
    const price = product.variants[0]?.prices[0]?.amount || 0;

    // Find items with same StyleDNA (Category + Fabric + Work)
    return products.filter(p => {
        if (p.id === product.id) return true; // Include self
        const pPrice = p.variants[0]?.prices[0]?.amount || 0;
        return (
            getTagValue(p, 'Category') === cat &&
            getTagValue(p, 'Fabric') === fab &&
            getTagValue(p, 'Work Type') === work &&
            Math.abs(pPrice - price) < 50000 // Price range tolerance (+- 500 INR approx)
        );
    }).slice(0, 6); // Limit variants
  }, [product, products]);

  const handleColorSwitch = (variantProduct: Product) => {
      setProduct(variantProduct);
      setCurrentImageIndex(0);
      // Silently update URL without triggering scrolling or navigation events
      window.history.replaceState(null, '', `#/product/${variantProduct.id}`);
  };

  // --- SMART RECOMMENDATIONS LOGIC ---
  const recommendations = useMemo(() => {
    if (!product || !products.length) return [];
    
    const currentColor = getTagValue(product, 'Color');
    const currentCat = getTagValue(product, 'Category');
    const variantIds = siblings.map(s => s.id);

    return products
      .filter(p => p.id !== product.id && !variantIds.includes(p.id)) // Exclude self and variants
      .map(p => {
        let score = 0;
        if (getTagValue(p, 'Color') === currentColor) score += 10;
        if (getTagValue(p, 'Category') === currentCat) score += 5;
        if (getTagValue(p, 'Occasion') === getTagValue(product, 'Occasion')) score += 2;
        return { product: p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(item => item.product);
  }, [product, products, siblings]);

  const breadcrumbs = useMemo(() => {
    if (!product) return [];
    const categorySlug = getTagValue(product, 'Category');
    const path = getBreadcrumbPath(categorySlug);
    return [...path, { label: product.title, path: `/product/${product.id}` }];
  }, [product]);

  if (isLoading) return <div className="min-h-screen bg-brand-ivory flex items-center justify-center">Loading...</div>;

  // --- FALLBACK UI ---
  if (!product || !validationResult.isValid) {
      return (
        <div className="min-h-screen bg-brand-ivory flex flex-col items-center justify-center p-4 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400">
                <AlertOctagon size={40} />
            </div>
            <h1 className="text-2xl font-serif text-slate-800 mb-2">Product Unavailable</h1>
            <p className="text-slate-500 max-w-md mb-8">This item is currently hidden due to missing information.</p>
            <Link to="/catalog" className="px-8 py-3 bg-brand-primary text-white rounded-lg font-bold uppercase tracking-widest text-xs">Browse Collection</Link>
        </div>
      );
  }

  // --- MAIN RENDER ---
  const price = product.variants[0].prices[0].amount / 100;
  const variantId = product.variants[0].id;
  const metadata = product.metadata || {};
  const inWishlist = isInWishlist(product.id);
  const currentColor = getTagValue(product, 'Color');

  return (
    <div className="bg-brand-ivory min-h-screen pt-4 pb-20">
      <SEOHelper 
        title={product.title}
        description={product.description || `Buy ${product.title} online.`}
        type="product"
        product={product}
        breadcrumbs={breadcrumbs}
      />

      {/* --- FULLSCREEN IMAGE OVERLAY --- */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center animate-fade-in"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button onClick={() => setIsFullscreen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 z-[130]">
            <X size={32} />
          </button>
          <button onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full hidden md:block">
            <ChevronLeft size={48} />
          </button>
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img src={images[currentImageIndex]} alt="Fullscreen View" className="max-w-full max-h-full object-contain" />
          </div>
          <button onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full hidden md:block">
            <ChevronRight size={48} />
          </button>
        </div>
      )}

      <div className="container mx-auto px-4 lg:px-12">
        <div className="mb-4">
          <Breadcrumb items={breadcrumbs} />
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* --- IMAGE GALLERY --- */}
          <div className="w-full lg:w-3/5 flex flex-col-reverse lg:flex-row gap-4">
             {/* Thumbnails */}
             <div className="hidden lg:flex flex-col gap-4 w-24 overflow-y-auto max-h-[600px] no-scrollbar">
                {images.map((img, idx) => (
                    <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`border-2 transition-all ${currentImageIndex === idx ? 'border-brand-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                        <img src={img} className="w-full aspect-[3/4] object-cover" loading="lazy" />
                    </button>
                ))}
             </div>
             
             {/* Main Image */}
             <div 
               className="flex-1 bg-brand-gray aspect-[3/4] lg:aspect-[4/5] relative group overflow-hidden touch-pan-y"
               onTouchStart={handleTouchStart}
               onTouchMove={handleTouchMove}
               onTouchEnd={handleTouchEnd}
             >
                <img src={images[currentImageIndex]} alt={product.title} className="w-full h-full object-cover transition-opacity duration-300" loading="eager" />
                
                <button onClick={handlePrevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                  <ChevronLeft size={20} className="text-slate-800" />
                </button>
                <button onClick={handleNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                  <ChevronRight size={20} className="text-slate-800" />
                </button>

                {/* Mobile Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
                  {images.map((_, idx) => (
                    <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-brand-primary w-4' : 'bg-brand-primary/30 w-1.5'}`} />
                  ))}
                </div>

                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button onClick={() => toggleWishlist(product.id)} className={`p-3 rounded-full transition-colors shadow-sm ${inWishlist ? 'bg-brand-primary text-white' : 'bg-white/90 hover:text-brand-primary text-slate-600'}`}>
                      <Heart size={20} fill={inWishlist ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => setIsFullscreen(true)} className="p-3 bg-white/90 rounded-full hover:bg-brand-primary hover:text-white transition-colors text-slate-600 shadow-sm">
                    <Maximize2 size={20} />
                  </button>
                </div>
             </div>
          </div>

          {/* --- PRODUCT DETAILS & ACTIONS --- */}
          <div className="w-full lg:w-2/5 lg:py-4 sticky top-24 h-fit">
             <div className="border-b border-brand-primary/10 pb-6 mb-6">
                <div className="flex justify-between items-start">
                   <p className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-2">Vaibava Lakshmi Exclusive</p>
                   {metadata['Dispatch Time'] === '24 Hours' && (
                     <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                        <Clock size={10} /> Ready to Ship
                     </span>
                   )}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-serif text-brand-primary mb-4 leading-tight">{product.title}</h1>
                <p className="text-2xl font-medium text-slate-900 mb-4">₹{price.toLocaleString()}</p>
                
                {/* Color Variants Selector */}
                {siblings.length > 1 && (
                  <div className="mb-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Available Colors: <span className="text-slate-900">{currentColor}</span>
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {siblings.map(sib => {
                        const colName = getTagValue(sib, 'Color') || 'Multi';
                        const hex = COLOR_MAP[colName] || '#eee';
                        const isSelected = sib.id === product.id;
                        
                        return (
                          <button
                            key={sib.id}
                            onClick={() => handleColorSwitch(sib)}
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-brand-primary scale-110 shadow-md' : 'border-slate-200 hover:border-slate-400'}`}
                            title={colName}
                            aria-label={`Select ${colName}`}
                          >
                            <div 
                              className="w-8 h-8 rounded-full border border-slate-100 shadow-inner" 
                              style={{ background: hex }} 
                            />
                            {isSelected && <Check size={14} className="absolute text-white drop-shadow-md" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <p className="text-sm text-slate-600 leading-relaxed font-light">{product.description}</p>
             </div>

             {/* Actions */}
             <div className="space-y-6 mb-8">
                 <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-800 uppercase tracking-wide">Size</span>
                    <button className="flex items-center text-brand-primary hover:underline"><Ruler size={14} className="mr-1"/> Size Guide</button>
                 </div>
                 <div className="flex gap-3">
                    <button className="px-4 py-2 border-2 border-brand-primary text-brand-primary font-bold text-sm bg-brand-primary/5">
                        {product.variants[0]?.title || 'Standard'}
                    </button>
                 </div>
             </div>

             <div className="flex gap-4 mb-8">
                <button 
                    onClick={() => { addToCart(variantId, 1); navigate('/cart'); }}
                    className="flex-1 bg-brand-primary text-white py-4 uppercase tracking-widest text-sm font-medium hover:bg-brand-secondary transition-colors shadow-lg shadow-brand-primary/20"
                >
                    Add to Bag
                </button>
                <button className="p-4 border border-slate-300 text-slate-600 hover:text-brand-primary hover:border-brand-primary transition-colors">
                    <Share2 size={20} />
                </button>
             </div>

             {/* Trust Badges */}
             <div className="bg-white p-6 border border-slate-100 rounded-lg space-y-4 shadow-sm">
                 <div className="flex items-start gap-3">
                    <Truck className="text-brand-gold mt-1" size={20} />
                    <div>
                        <h4 className="text-sm font-bold text-slate-800">Dispatch & Delivery</h4>
                        <p className="text-xs text-slate-500">{metadata['Dispatch Time'] ? `Dispatches in ${metadata['Dispatch Time']}` : 'Dispatches in 2-3 Days'}.</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-3">
                    <RotateCcw className="text-brand-gold mt-1" size={20} />
                    <div>
                        <h4 className="text-sm font-bold text-slate-800">Return Policy</h4>
                        <p className="text-xs text-slate-500">{metadata['Return Eligible'] === 'Yes' ? 'Easy 7-day returns available.' : 'No returns on this item.'}</p>
                    </div>
                 </div>
             </div>

             {/* Specs */}
             <div className="mt-8 pt-8 border-t border-brand-primary/10">
                <h3 className="font-serif text-lg text-brand-primary mb-4">Product Specifications</h3>
                <div className="grid grid-cols-2 gap-y-3 text-sm bg-white p-4 rounded border border-slate-100">
                    <div className="text-slate-500">Fabric</div><div className="text-slate-800 font-medium">{getTagValue(product, 'Fabric') || '-'}</div>
                    <div className="text-slate-500">Occasion</div><div className="text-slate-800 font-medium">{getTagValue(product, 'Occasion') || '-'}</div>
                    <div className="text-slate-500">Color</div><div className="text-slate-800 font-medium">{getTagValue(product, 'Color') || '-'}</div>
                    <div className="text-slate-500">Work Type</div><div className="text-slate-800 font-medium">{getTagValue(product, 'Work Type') || '-'}</div>
                    {Object.entries(metadata).map(([key, value]) => (
                         key !== 'Description' && key !== 'Dispatch Time' && key !== 'Return Eligible' && (
                            <React.Fragment key={key}>
                                <div className="text-slate-500">{key}</div><div className="text-slate-800 font-medium">{String(value)}</div>
                            </React.Fragment>
                         )
                    ))}
                </div>
             </div>
          </div>
        </div>

        {/* --- SMART RECOMMENDATIONS --- */}
        {recommendations.length > 0 && (
          <div className="mt-20 border-t border-slate-200 pt-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif text-slate-900">You May Also Like</h2>
              <Link to={`/catalog?cat=${getTagValue(product, 'Category')}`} className="text-sm font-bold text-brand-primary hover:underline">View Collection</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recommendations.map(rec => (
                <Link to={`/product/${rec.id}`} key={rec.id} className="group block">
                  <div className="relative aspect-[3/4] bg-slate-100 mb-3 overflow-hidden rounded-lg">
                    <img src={rec.thumbnail} alt={rec.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="text-sm font-serif text-slate-900 group-hover:text-brand-primary line-clamp-1">{rec.title}</h3>
                  <p className="text-xs text-slate-500 mb-1">{getTagValue(rec, 'Fabric')}</p>
                  <p className="text-sm font-bold text-slate-800">₹{(rec.variants[0].prices[0].amount / 100).toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile Sticky Add to Cart */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t p-4 z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <button 
            onClick={() => { addToCart(variantId, 1); navigate('/cart'); }}
            className="w-full bg-brand-primary text-white py-3 uppercase tracking-widest text-sm font-bold shadow-lg"
          >
            Add to Bag - ₹{price.toLocaleString()}
          </button>
      </div>
    </div>
  );
};

export default ProductDetail;