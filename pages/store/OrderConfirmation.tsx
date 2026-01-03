
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';

const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col p-4">
              <p className="text-slate-500 mb-4">No order details found.</p>
              <Link to="/" className="text-brand-primary underline">Return Home</Link>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={40} />
        </div>
        
        <h1 className="text-2xl font-serif font-bold text-slate-900 mb-2">Order Confirmed!</h1>
        <p className="text-slate-500 mb-6">Thank you for your purchase. We have sent a confirmation email to <strong>{order.email}</strong>.</p>
        
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Order ID</p>
            <p className="text-xl font-mono font-bold text-brand-primary">#{order.display_id}</p>
        </div>

        <div className="space-y-4">
            <Link to="/catalog" className="block w-full py-4 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors">
                Continue Shopping
            </Link>
            <Link to="/" className="block w-full py-4 text-slate-600 font-medium hover:text-slate-900">
                Back to Home
            </Link>
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-slate-400">
        <p>Need help? Contact us at support@vaibavalakshmi.com</p>
      </div>
    </div>
  );
};

export default OrderConfirmation;
