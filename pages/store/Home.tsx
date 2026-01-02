import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { ArrowRight, Star, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { BRAND_ASSETS } from '../../constants';

const Home: React.FC = () => {
  const { products } = useStore();
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative bg-brand-dark text-white overflow-hidden">
        <div className="absolute inset-0 bg-brand-primary/80 mix-blend-multiply z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2574&auto=format&fit=crop" 
          alt="Saree Banner" 
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-50"
        />
        <div className="relative z-20 container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-2xl space-y-6">
            <span className="inline-block px-3 py-1 bg-brand-accent text-white font-bold text-sm rounded-full tracking-wider uppercase">New Wedding Collection</span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight font-serif text-brand-gold">
              Timeless Elegance of Kanchipuram
            </h1>
            <p className="text-lg md:text-xl text-rose-100 opacity-90 max-w-lg">
              Discover our exclusive range of handwoven silks and designer ethnic wear for the festive season.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/catalog" className="px-8 py-3 bg-white text-brand-primary font-bold rounded shadow-lg hover:bg-brand-light transition-colors">
                Shop Now
              </Link>
              <Link to="/catalog?cat=Sarees" className="px-8 py-3 border-2 border-brand-gold text-brand-gold font-bold rounded hover:bg-brand-gold hover:text-brand-dark transition-colors">
                View Sarees
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 -mt-8 relative z-30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹4999' },
            { icon: ShieldCheck, title: 'Secure Payment', desc: '100% Secure Transaction' },
            { icon: RefreshCw, title: 'Easy Returns', desc: '7 Day Return Policy' }
          ].map((feature, idx) => (
            <div key={idx} className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-md border-t-4 border-brand-accent">
              <div className="p-3 bg-brand-light text-brand-primary rounded-lg">
                <feature.icon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">{feature.title}</h3>
                <p className="text-slate-500 text-sm mt-1">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 pt-8">
        <div className="flex justify-between items-end mb-8 border-b border-brand-light pb-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 font-serif">Featured Collection</h2>
            <p className="text-slate-500 mt-2">Handpicked favorites just for you</p>
          </div>
          <Link to="/catalog" className="hidden md:flex items-center text-brand-primary font-medium hover:text-brand-dark">
            View All <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => {
            const price = product.variants?.[0]?.prices?.[0]?.amount 
                ? product.variants[0].prices[0].amount / 100 
                : 0;
            const category = product.tags?.[0]?.value || 'Collection';

            return (
              <Link key={product.id} to={`/product/${product.id}`} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all border border-brand-light overflow-hidden">
                <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                  <img 
                    src={product.thumbnail} 
                    alt={product.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-slate-800 flex items-center shadow-sm">
                    4.5 <Star size={10} className="ml-1 text-brand-gold fill-brand-gold" />
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-brand-primary font-medium mb-1 uppercase tracking-wider">{category}</p>
                  <h3 className="font-semibold text-slate-800 text-sm mb-2 line-clamp-1 group-hover:text-brand-primary transition-colors">{product.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-slate-900 font-serif">₹{price.toLocaleString()}</span>
                    <button className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-primary hover:bg-brand-primary hover:text-white transition-colors">
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <Link to="/catalog" className="inline-flex items-center text-brand-primary font-medium">
            View All Products <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-brand-light py-12">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2 font-serif">Visit Our Store</h2>
            <p className="text-slate-500 mb-6">{BRAND_ASSETS.address}</p>
            <div className="w-full h-96 bg-white p-2 rounded-xl overflow-hidden shadow-lg border border-brand-primary/10">
                <iframe 
                    src={BRAND_ASSETS.map_embed} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0, borderRadius: '8px' }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade">
                </iframe>
            </div>
        </div>
      </section>
    </div>
  );
};

export default Home;