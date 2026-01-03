
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Trash2, CreditCard, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Cart: React.FC = () => {
  const { cart, removeFromCart, isLoading } = useStore();
  const navigate = useNavigate();

  if (!cart?.items?.length) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Your cart is empty</h2>
        <Link to="/catalog" className="inline-block px-6 py-2 border-2 border-emerald-900 text-emerald-900 font-medium rounded-lg">
          Browse Products
        </Link>
      </div>
    );
  }

  const subtotal = (cart.subtotal || 0) / 100;
  const total = (cart.total || 0) / 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(item => (
            <div key={item.id} className="flex gap-4 p-4 bg-white border rounded-lg shadow-sm">
              <img src={item.thumbnail} alt={item.title} className="w-24 h-24 object-cover rounded-md bg-slate-100" />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.description}</p>
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-sm text-slate-600">Qty: {item.quantity}</div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-900">₹{(item.unit_price / 100).toLocaleString()}</span>
                    <button onClick={() => removeFromCart(item.id)} disabled={isLoading} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg text-slate-800">
                <span>Total</span><span>₹{total.toLocaleString()}</span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/checkout')}
              disabled={isLoading}
              className="w-full bg-emerald-900 text-white py-4 rounded-lg font-bold hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Secure Checkout <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
