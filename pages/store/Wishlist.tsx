import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';

const Wishlist: React.FC = () => {
  const { wishlist, products, toggleWishlist, addToCart } = useStore();

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mb-6 text-brand-primary">
            <Heart size={32} />
        </div>
        <h2 className="text-2xl font-serif text-slate-800 mb-2">Your wishlist is empty</h2>
        <p className="text-slate-500 mb-8 max-w-sm">Save your favorite styles here to review them later.</p>
        <Link to="/catalog" className="px-8 py-3 bg-brand-primary text-white rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-brand-secondary transition-colors">
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-2xl font-serif text-slate-800 mb-8 border-b pb-4">My Wishlist ({wishlist.length})</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistProducts.map(product => {
            const price = product.variants[0]?.prices[0]?.amount / 100;
            const variantId = product.variants[0]?.id;

            return (
                <div key={product.id} className="flex gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                    <Link to={`/product/${product.id}`} className="shrink-0 w-24 h-32 bg-slate-100 rounded-lg overflow-hidden">
                        <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover" />
                    </Link>
                    
                    <div className="flex flex-col flex-1 justify-between py-1">
                        <div>
                            <div className="flex justify-between items-start">
                                <Link to={`/product/${product.id}`} className="font-serif text-slate-800 font-medium hover:text-brand-primary line-clamp-2 pr-4">
                                    {product.title}
                                </Link>
                                <button 
                                    onClick={() => toggleWishlist(product.id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                    title="Remove"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <p className="text-brand-primary font-bold mt-1">₹{price.toLocaleString()}</p>
                        </div>
                        
                        <button 
                            onClick={() => { addToCart(variantId, 1); toggleWishlist(product.id); }}
                            className="mt-3 py-2 px-4 bg-slate-900 text-white text-xs font-bold uppercase rounded hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <ShoppingBag size={14} /> Move to Bag
                        </button>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default Wishlist;