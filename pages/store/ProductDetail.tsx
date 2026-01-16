import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Truck, ShieldCheck, Heart, Share2, Ruler, Clock, RotateCcw } from 'lucide-react';
import { Product } from '../../types';
import SEOHelper from '../../components/Shared/SEOHelper';
import Breadcrumb from '../../components/Shared/Breadcrumb';
import { getBreadcrumbPath } from '../../utils/categoryHelpers';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, addToCart, isLoading } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImg, setActiveImg] = useState<string>('');

  useEffect(() => {
    if (products.length > 0 && id) {
      const found = products.find(p => p.id === id);
      if (found) {
        setProduct(found);
        setActiveImg(found.thumbnail);
      }
    }
  }, [products, id]);

  // Helper to extract Tag Value by Key
  const getTagValue = (key: string) => product?.tags?.find(t => t.value.startsWith(`${key}:`))?.value.split(':')[1];

  const breadcrumbs = useMemo(() => {
    if (!product) return [];
    
    const categorySlug = getTagValue('Category');
    const path = getBreadcrumbPath(categorySlug);
    
    // Append current product
    return [...path, { label: product.title, path: `/product/${product.id}` }];
  }, [product]);

  if (isLoading || !product) return <div className="min-h-screen bg-brand-ivory flex items-center justify-center">Loading...</div>;

  const price = product.variants[0]?.prices[0]?.amount / 100 || 0;
  const variantId = product.variants[0]?.id;
  const metadata = product.metadata || {};

  return (
    <div className="bg-brand-ivory min-h-screen pt-4 pb-20">
      <SEOHelper 
        title={product.title}
        description={product.description}
        type="product"
        product={product}
        breadcrumbs={breadcrumbs}
      />

      <div className="container mx-auto px-4 lg:px-12">
        
        {/* Dynamic Breadcrumb Navigation */}
        <div className="mb-4">
          <Breadcrumb items={breadcrumbs} />
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Image Gallery */}
          <div className="w-full lg:w-3/5 flex gap-4">
             {/* Thumbnails (Desktop) */}
             <div className="hidden lg:flex flex-col gap-4 w-24">
                {[product.thumbnail, product.thumbnail, product.thumbnail].map((img, idx) => (
                    <button key={idx} onClick={() => setActiveImg(img)} className={`border-2 ${activeImg === img ? 'border-brand-primary' : 'border-transparent'}`}>
                        <img src={img} className="w-full aspect-[3/4] object-cover" loading="lazy" alt={`View ${idx + 1}`} />
                    </button>
                ))}
             </div>
             
             {/* Main Image */}
             <div className="flex-1 bg-brand-gray aspect-[3/4] lg:aspect-[4/5] overflow-hidden relative">
                <img src={activeImg} alt={product.title} className="w-full h-full object-cover" loading="eager" />
                <button className="absolute top-4 right-4 p-3 bg-white/80 rounded-full hover:text-brand-primary transition-colors">
                    <Heart size={20} />
                </button>
             </div>
          </div>

          {/* Product Info */}
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
                <p className="text-sm text-slate-600 leading-relaxed font-light">{product.description}</p>
             </div>

             {/* Variant & Size Selection */}
             <div className="space-y-6 mb-8">
                 <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-800 uppercase tracking-wide">Size</span>
                    <button className="flex items-center text-brand-primary hover:underline"><Ruler size={14} className="mr-1"/> Size Guide</button>
                 </div>
                 <div className="flex gap-3">
                    {/* Assuming Free Size for Sarees, or S/M/L for others */}
                    <button className="px-4 py-2 border-2 border-brand-primary text-brand-primary font-bold text-sm bg-brand-primary/5">
                        {product.variants[0]?.title || 'Standard'}
                    </button>
                 </div>
             </div>

             {/* Action Buttons */}
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

             {/* Trust & Policy Badges */}
             <div className="bg-white p-6 border border-slate-100 rounded-lg space-y-4 shadow-sm">
                 <div className="flex items-start gap-3">
                    <Truck className="text-brand-gold mt-1" size={20} />
                    <div>
                        <h4 className="text-sm font-bold text-slate-800">Dispatch & Delivery</h4>
                        <p className="text-xs text-slate-500">
                           {metadata['Dispatch Time'] ? `Dispatches in ${metadata['Dispatch Time']}` : 'Dispatches in 2-3 Days'}. 
                           Free shipping on orders above ₹10,000.
                        </p>
                    </div>
                 </div>
                 <div className="flex items-start gap-3">
                    <RotateCcw className="text-brand-gold mt-1" size={20} />
                    <div>
                        <h4 className="text-sm font-bold text-slate-800">Return Policy</h4>
                        <p className="text-xs text-slate-500">
                           {metadata['Return Eligible'] === 'Yes' ? 'Easy 7-day returns available.' : 'This item is not eligible for return due to hygiene/customization.'}
                        </p>
                    </div>
                 </div>
                 <div className="flex items-start gap-3">
                    <ShieldCheck className="text-brand-gold mt-1" size={20} />
                    <div>
                        <h4 className="text-sm font-bold text-slate-800">Authenticity Guaranteed</h4>
                        <p className="text-xs text-slate-500">100% Original {getTagValue('Fabric') || 'Product'} with quality check.</p>
                    </div>
                 </div>
             </div>

             {/* Detailed Specifications Table */}
             <div className="mt-8 pt-8 border-t border-brand-primary/10">
                <h3 className="font-serif text-lg text-brand-primary mb-4">Product Specifications</h3>
                <div className="grid grid-cols-2 gap-y-3 text-sm bg-white p-4 rounded border border-slate-100">
                    
                    {/* Dynamic Tags */}
                    <div className="text-slate-500">Fabric</div>
                    <div className="text-slate-800 font-medium">{getTagValue('Fabric') || '-'}</div>
                    
                    <div className="text-slate-500">Occasion</div>
                    <div className="text-slate-800 font-medium">{getTagValue('Occasion') || '-'}</div>

                    <div className="text-slate-500">Color</div>
                    <div className="text-slate-800 font-medium">{getTagValue('Color') || '-'}</div>

                    <div className="text-slate-500">Work Type</div>
                    <div className="text-slate-800 font-medium">{getTagValue('Work Type') || '-'}</div>

                    {/* Dynamic Metadata */}
                    {Object.entries(metadata).map(([key, value]) => (
                         key !== 'Description' && key !== 'Dispatch Time' && key !== 'Return Eligible' && (
                            <React.Fragment key={key}>
                                <div className="text-slate-500">{key}</div>
                                <div className="text-slate-800 font-medium">{String(value)}</div>
                            </React.Fragment>
                         )
                    ))}
                </div>
             </div>

          </div>
        </div>
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