import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/account/orders";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-ivory flex flex-col items-center justify-center p-4">
      {/* Brand Logo Navigation */}
      <Link to="/" className="mb-8 text-3xl font-serif font-bold text-brand-primary tracking-tight hover:opacity-80 transition-opacity">
        Vaibava<span className="text-brand-gold italic">Lakshmi</span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        <div className="p-8 text-center border-b border-slate-100">
            <h2 className="text-2xl font-serif text-slate-800 mb-1">Welcome Back</h2>
            <p className="text-slate-500 text-sm">Sign in to access your orders and wishlist</p>
        </div>

        <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="email" 
                            required
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="password" 
                            required
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-brand-primary text-white py-4 rounded-lg font-bold hover:bg-brand-secondary transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {isLoading ? 'Signing In...' : 'Sign In'} <ArrowRight size={18} />
                </button>
            </form>
            
            <div className="mt-8 text-center pt-6 border-t border-slate-100">
                <p className="text-sm text-slate-600">
                    Don't have an account? <a href="#" className="text-brand-primary font-bold hover:underline">Register</a>
                </p>
                <Link to="/admin/login" className="block mt-4 text-xs text-slate-400 hover:text-slate-600">Are you an admin?</Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;