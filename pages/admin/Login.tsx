
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { BRAND_ASSETS } from '../../constants';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-ivory flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-brand-primary p-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Lock className="text-brand-gold" size={32} />
            </div>
            <h2 className="text-2xl font-serif text-white mb-1">Operator Access</h2>
            <p className="text-brand-gold/80 text-sm">Vaibava Lakshmi System</p>
        </div>

        {/* Form */}
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
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="email" 
                            required
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                            placeholder="operator@vaibava.com"
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
                    className="w-full bg-slate-900 text-white py-4 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {isLoading ? 'Verifying...' : 'Secure Login'} <ArrowRight size={18} />
                </button>
            </form>
            
            <div className="mt-8 text-center">
                <p className="text-xs text-slate-400">
                    Protected by RBAC & Audit Logging.<br/>
                    Unauthorized access is monitored.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
