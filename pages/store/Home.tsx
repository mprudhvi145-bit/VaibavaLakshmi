import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { ArrowRight, Star } from 'lucide-react';
import { CATEGORY_HIERARCHY } from '../../constants';

const Home: React.FC = () => {
  const { products } = useStore();
  
  // Luxury Placeholder Images
  const HERO_IMAGE = "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?q=80&w=2000&auto=format&fit=crop"; 
  const CAT_BRIDAL = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop";
  const CAT_GROOM = "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=600&auto=format&fit=crop";
  const CAT_FESTIVE = "https://images.unsplash.com/photo-1583391733958-d775f977d0b9?q=80&w=600&auto=format&fit=crop";

  return (
    <div className="bg-brand-ivory">
      
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-10"></div>
        <img 
          src={HERO_IMAGE} 
          alt="Royal Wedding Collection" 
          className="absolute inset-0 w-full h-full object-cover animate-fade-in"
        />
        <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4 animate-slide-up">
          <p className="text-white text-xs md:text-sm tracking-[0.3em] uppercase mb-4 drop-shadow-md">
            The Royal Wedding Edit '24
          </p>
          <h1 className="text-5xl md:text-8xl font-serif text-white mb-8 drop-shadow-lg">
            Timeless <span className="italic text-brand-gold">Elegance</span>
          </h1>
          <Link 
            to="/catalog?cat=wedding-edit" 
            className="px-10 py-4 bg-brand-primary text-white text-sm tracking-widest uppercase hover:bg-white hover:text-brand-primary transition-all duration-300 border border-transparent hover:border-brand-primary"
          >
            Explore Collection
          </Link>
        </div>
      </section>

      {/* Category Spotlight */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-brand-primary mb-2">Curated Collections</h2>
          <div className="w-16 h-0.5 bg-brand-gold mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
           {/* Card 1 */}
           <Link to="/catalog?cat=women-sarees" className="group cursor-pointer">
             <div className="overflow-hidden mb-6 aspect-[3/4]">
               <img src={CAT_BRIDAL} alt="Bridal" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
             </div>
             <div className="text-center">
               <h3 className="text-xl font-serif text-brand-primary group-hover:text-brand-gold transition-colors">The Royal Bride</h3>
               <p className="text-xs text-slate-500 uppercase tracking-widest mt-2">Kanchipuram & Banarasi</p>
             </div>
           </Link>

           {/* Card 2 */}
           <Link to="/catalog?cat=men-wedding" className="group cursor-pointer mt-0 md:-mt-12">
             <div className="overflow-hidden mb-6 aspect-[3/4] border-4 border-brand-gold/10">
               <img src={CAT_GROOM} alt="Groom" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
             </div>
             <div className="text-center">
               <h3 className="text-xl font-serif text-brand-primary group-hover:text-brand-gold transition-colors">The Regal Groom</h3>
               <p className="text-xs text-slate-500 uppercase tracking-widest mt-2">Sherwani & Kurta Sets</p>
             </div>
           </Link>

           {/* Card 3 */}
           <Link to="/catalog?cat=women-ethnic" className="group cursor-pointer">
             <div className="overflow-hidden mb-6 aspect-[3/4]">
               <img src={CAT_FESTIVE} alt="Festive" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
             </div>
             <div className="text-center">
               <h3 className="text-xl font-serif text-brand-primary group-hover:text-brand-gold transition-colors">Festive Edit</h3>
               <p className="text-xs text-slate-500 uppercase tracking-widest mt-2">Designer Lehengas</p>
             </div>
           </Link>
        </div>
      </section>

      {/* Shop By Fabric (New Section) */}
      <section className="py-16 bg-brand-secondary text-brand-ivory">
         <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif text-center mb-12">Shop By Fabric</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
               {['Pure Silk', 'Georgette', 'Chiffon', 'Organza', 'Cotton', 'Crepe'].map((fab, i) => (
                  <Link to={`/catalog?cat=all&fabric=${fab}`} key={i} className="group text-center">
                     <div className="w-24 h-24 mx-auto rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-4 group-hover:bg-brand-gold group-hover:text-brand-text transition-colors duration-300">
                        <span className="font-serif text-xl italic">{fab[0]}</span>
                     </div>
                     <h4 className="text-sm font-medium tracking-widest uppercase">{fab}</h4>
                  </Link>
               ))}
            </div>
         </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-xs text-brand-gold uppercase tracking-widest mb-2">Exclusive</p>
              <h2 className="text-3xl md:text-4xl font-serif text-brand-primary">New Arrivals</h2>
            </div>
            <Link to="/catalog" className="hidden md:flex items-center text-sm uppercase tracking-widest text-brand-primary hover:text-brand-gold transition-colors">
              View All <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {products.slice(0, 4).map((product) => (
              <Link to={`/product/${product.id}`} key={product.id} className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-brand-gray mb-4">
                  <img 
                    src={product.thumbnail} 
                    alt={product.title} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Quick Add Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-white/90 py-3 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">Quick View</span>
                  </div>
                </div>
                <h3 className="text-sm md:text-base font-serif text-brand-primary mb-1 line-clamp-1 group-hover:text-brand-gold transition-colors">{product.title}</h3>
                <p className="text-sm font-medium text-slate-800">₹{(product.variants[0].prices[0].amount / 100).toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;