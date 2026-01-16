import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { CheckoutService } from '../../services/checkout.service';
import { ShieldCheck, Truck, CreditCard, ChevronDown, Check, AlertCircle, ArrowLeft, Lock } from 'lucide-react';

// Steps
const STEP_ADDRESS = 1;
const STEP_PAYMENT = 2;

const Checkout: React.FC = () => {
  const { cart, validateCart, placeOrder, trackEvent } = useStore();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(STEP_ADDRESS);
  const [error, setError] = useState('');
  const [totals, setTotals] = useState<any>(null);
  
  // Form State
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  
  // Processing States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevents double submit

  // Initial Calculation
  useEffect(() => {
    if (!cart?.items.length) {
        navigate('/cart');
        return;
    }
    const loadTotals = async () => {
        try {
            const data = await validateCart();
            setTotals(data);
            trackEvent('checkout_start', { value: data.total / 100, items: data.items.length });
        } catch (e) {
            setError('Could not validate cart. Please try again.');
        }
    };
    loadTotals();
  }, [cart]);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !address || !city || !postalCode || !phone) {
        setError('Please fill in all required fields.');
        return;
    }
    if (phone.length < 10) {
        setError('Please enter a valid phone number.');
        return;
    }
    setError('');
    setStep(STEP_PAYMENT);
    window.scrollTo(0, 0);
    trackEvent('checkout_step_2', { step: 'payment' });
  };

  const handlePayment = async () => {
    if (isSubmitting || isProcessing) return;
    
    setIsProcessing(true);
    setIsSubmitting(true); // Lock
    setError('');
    
    try {
        // 1. Create Intent
        const intent = await CheckoutService.createPaymentIntent(totals.total);
        
        // 2. Simulate Payment Gateway Interaction
        // In real life, this would open a modal or redirect
        await new Promise(resolve => setTimeout(resolve, 2000)); 
        
        // 3. Place Order with Payment ID
        const order = await placeOrder({
            cart: {
                items: cart!.items,
                email,
                customer: { first_name: firstName, last_name: lastName, phone },
                shipping_address: { first_name: firstName, last_name: lastName, address_1: address, city, postal_code: postalCode, phone, country_code: 'in' }
            },
            paymentId: intent.id
        });

        navigate('/order-confirmed', { state: { order } });

    } catch (e: any) {
        setError(e.response?.data?.error || e.message || 'Payment failed. Please try again.');
        setIsProcessing(false);
        setIsSubmitting(false); // Unlock on error
    }
  };

  if (!totals) return <div className="p-8 text-center min-h-screen flex items-center justify-center">Preparing Secure Checkout...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
        
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <button onClick={() => step === STEP_ADDRESS ? navigate('/cart') : setStep(STEP_ADDRESS)} className="text-slate-500 flex items-center">
                    <ArrowLeft size={20} className="mr-2" /> <span className="hidden md:inline">Back</span>
                </button>
                <h1 className="font-serif font-bold text-lg text-slate-800">Secure Checkout</h1>
                <div className="w-8"></div>
            </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-lg">
            
            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm flex items-start gap-2 mb-6 border border-red-100">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span className="flex-1">{error}</span>
                </div>
            )}

            {/* STEP 1: ADDRESS */}
            {step === STEP_ADDRESS && (
                <form onSubmit={handleAddressSubmit} className="space-y-6 animate-fade-in">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Truck size={20} className="text-brand-primary" /> Shipping Address
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-primary outline-none" placeholder="you@example.com" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                                    <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-primary outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                                    <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-primary outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                                <input type="text" required value={address} onChange={e => setAddress(e.target.value)} className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-primary outline-none" placeholder="Street, Flat No" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City</label>
                                    <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-primary outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pincode</label>
                                    <input type="text" required value={postalCode} onChange={e => setPostalCode(e.target.value)} className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-primary outline-none" maxLength={6} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                                <div className="flex">
                                    <span className="bg-slate-100 border border-r-0 rounded-l-lg p-3 text-sm text-slate-500">+91</span>
                                    <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full border rounded-r-lg p-3 text-sm focus:ring-2 focus:ring-brand-primary outline-none" placeholder="9876543210" maxLength={10} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4">Order Summary</h3>
                        <div className="space-y-2 text-sm text-slate-600">
                            <div className="flex justify-between"><span>Subtotal</span> <span>₹{(totals.subtotal / 100).toLocaleString()}</span></div>
                            <div className="flex justify-between"><span>Shipping</span> <span>{totals.shipping === 0 ? 'Free' : `₹${totals.shipping / 100}`}</span></div>
                            <div className="flex justify-between"><span>Tax (5%)</span> <span>₹{(totals.tax / 100).toLocaleString()}</span></div>
                            <div className="border-t pt-3 flex justify-between font-bold text-lg text-slate-900">
                                <span>Total</span>
                                <span>₹{(totals.total / 100).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-brand-primary text-white py-4 rounded-lg font-bold shadow-lg hover:bg-brand-secondary transition-colors">
                        Continue to Payment
                    </button>
                </form>
            )}

            {/* STEP 2: PAYMENT */}
            {step === STEP_PAYMENT && (
                <div className="animate-slide-up space-y-6">
                    {/* Summary Review */}
                    <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 flex justify-between items-center">
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase">Ship To</p>
                            <p className="text-sm font-medium text-slate-800">{address}, {city} - {postalCode}</p>
                        </div>
                        <button onClick={() => setStep(STEP_ADDRESS)} className="text-xs font-bold text-brand-primary underline">Edit</button>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Lock size={20} className="text-emerald-600" /> Payment Method
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="border-2 border-brand-primary bg-brand-primary/5 p-4 rounded-lg flex items-center justify-between cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full border-4 border-brand-primary"></div>
                                    <span className="font-bold text-slate-800">Credit / Debit Card</span>
                                </div>
                                <CreditCard size={24} className="text-slate-400" />
                            </div>
                            <div className="border border-slate-200 p-4 rounded-lg flex items-center justify-between opacity-50 cursor-not-allowed">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full border border-slate-300"></div>
                                    <span className="font-medium text-slate-600">UPI (Coming Soon)</span>
                                </div>
                            </div>
                        </div>

                        {/* Mock Card Form */}
                        <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Card Number</label>
                                <input type="text" className="w-full border rounded-lg p-3 font-mono text-sm" placeholder="4242 4242 4242 4242" disabled={isProcessing} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expiry</label>
                                    <input type="text" className="w-full border rounded-lg p-3 font-mono text-sm" placeholder="MM/YY" disabled={isProcessing} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CVV</label>
                                    <input type="password" className="w-full border rounded-lg p-3 font-mono text-sm" placeholder="123" disabled={isProcessing} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handlePayment} 
                        disabled={isSubmitting}
                        className="w-full bg-emerald-600 text-white py-4 rounded-lg font-bold shadow-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Processing Payment...' : `Pay ₹${(totals.total / 100).toLocaleString()}`}
                        {!isSubmitting && <ShieldCheck size={18} />}
                    </button>
                    
                    <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                        <Lock size={12} /> SSL Encrypted. 100% Secure Transaction.
                    </p>
                </div>
            )}
        </div>
    </div>
  );
};

export default Checkout;