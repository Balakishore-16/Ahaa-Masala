
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Language, UserDetails, Order } from '../types';
import { TRANSLATIONS } from '../constants';
import { Button, Input, Select, Badge } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Upload, CheckCircle, ChevronLeft, ChevronRight, MessageCircle, Check, Search, Truck, PackageCheck, XCircle } from 'lucide-react';

export const Home: React.FC = () => {
  const { products, banners, language, addToCart } = useStore();
  const t = TRANSLATIONS[language];
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const activeBanners = banners.filter(b => b.active).sort((a,b) => a.order - b.order);

  // Auto Slide Effect
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const getVariant = (pid: string) => {
    const p = products.find(i => i.id === pid);
    if (!p) return null;
    const vid = selectedVariants[pid] || p.variants[0].id;
    return p.variants.find(v => v.id === vid) || p.variants[0];
  };

  const handleAddToCart = (productId: string, variantId: string) => {
    addToCart(productId, variantId, 1);
    setAddedItems(prev => ({ ...prev, [productId]: true }));
    setTimeout(() => {
        setAddedItems(prev => ({ ...prev, [productId]: false }));
    }, 2000);
  };

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  // Filter Products based on search
  const filteredProducts = products.filter(p => {
      if (!p.active) return false;
      const term = searchTerm.toLowerCase();
      const nameEn = p.name.toLowerCase();
      const nameTe = (p.nameTe || '').toLowerCase();
      return nameEn.includes(term) || nameTe.includes(term);
  });

  return (
    <div className="pb-20 animate-fade-in">
      {/* Hero Slider */}
      <div className="relative w-full h-48 md:h-96 bg-gray-100 overflow-hidden group">
        {activeBanners.length > 0 ? (
          activeBanners.map((b, index) => (
            <div 
              key={b.id} 
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentBannerIndex ? 'opacity-100' : 'opacity-0'}`}
            >
              <img src={b.image} alt={b.alt} className="w-full h-full object-cover" />
              {/* Overlay Gradient (Optional for text readability) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Banners Active</div>
        )}
        
        {/* Slider Controls */}
        {activeBanners.length > 1 && (
          <>
            <button onClick={prevBanner} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/80 p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
              <ChevronLeft size={24} className="text-gray-800"/>
            </button>
            <button onClick={nextBanner} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/80 p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
              <ChevronRight size={24} className="text-gray-800"/>
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {activeBanners.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentBannerIndex ? 'bg-white w-6' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search & Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-orange-600 pl-3 self-start md:self-center">{t.products}</h2>
            <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder={language === Language.EN ? "Search spices..." : "మసాలా వెతకండి..."}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-orange-500 outline-none bg-gray-50 transition-all hover:bg-white focus:bg-white shadow-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => {
            const variant = getVariant(product.id)!;
            const hasStock = variant.stock > 0;
            const isAdded = addedItems[product.id];
            
            return (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="aspect-square bg-gray-50 rounded-lg mb-4 overflow-hidden relative group">
                   <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   {!hasStock && (
                     <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                       <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow">Out of Stock</span>
                     </div>
                   )}
                </div>
                <h3 className="font-bold text-gray-800 text-lg truncate mb-1">{language === Language.TE ? product.nameTe || product.name : product.name}</h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2 min-h-[2.5em]">{language === Language.TE ? product.descriptionTe || product.description : product.description}</p>
                
                <div className="mt-auto">
                  {/* Quantity Chips */}
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-gray-400 block mb-2 uppercase tracking-wider">{t.weight}:</span>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map(v => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariants({...selectedVariants, [product.id]: v.id})}
                          className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                            variant.id === v.id 
                              ? 'bg-orange-600 text-white border-orange-600 shadow-sm' 
                              : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          {v.weight}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                       <span className="text-xs text-gray-400 block">{t.price}</span>
                       <span className="font-bold text-xl text-gray-800">₹{variant.price}</span>
                    </div>
                    
                    <button 
                      className={`text-sm px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-1 ${
                        !hasStock 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                          : isAdded 
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-orange-600 text-white hover:bg-orange-700'
                      }`}
                      disabled={!hasStock}
                      onClick={() => handleAddToCart(product.id, variant.id)}
                    >
                      {isAdded ? (
                          <><Check size={16}/> {t.added}</>
                      ) : (
                          t.addToCart
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
          ) : (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                <Search size={48} className="text-gray-300 mb-4" />
                <p className="text-lg">No products found matching "{searchTerm}"</p>
                <button onClick={() => setSearchTerm('')} className="text-orange-600 font-medium mt-2 hover:underline">Clear Search</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Cart: React.FC = () => {
  const { cart, products, updateCartQty, removeFromCart, language, getCartTotal } = useStore();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];
  const [coupon, setCoupon] = useState('');
  const [applied, setApplied] = useState('');

  const { subtotal, discount, total } = getCartTotal(applied);
  const isEmpty = cart.length === 0;

  if (isEmpty) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <ShoppingBag size={64} className="text-gray-300 mb-4" />
      <h2 className="text-xl font-bold text-gray-600 mb-4">{t.emptyCart}</h2>
      <Button onClick={() => navigate('/')}>{t.continueShopping}</Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 mb-4 hover:text-orange-600 transition-colors">
        <ArrowLeft size={16} className="mr-1"/> Back
      </button>
      <h1 className="text-2xl font-bold mb-6">{t.cart}</h1>
      <div className="space-y-4 mb-8">
        {cart.map(item => {
          const p = products.find(x => x.id === item.productId);
          const v = p?.variants.find(x => x.id === item.variantId);
          if (!p || !v) return null;

          return (
            <div key={`${item.productId}-${item.variantId}`} className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
              <img src={p.image} className="w-16 h-16 object-cover rounded bg-gray-100" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{language === Language.TE ? p.nameTe : p.name}</h3>
                <p className="text-xs text-gray-500">{v.weight}</p>
                <div className="font-bold text-orange-600 mt-1">₹{v.price}</div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => updateCartQty(item.productId, item.variantId, item.qty - 1)} className="p-1 rounded-full hover:bg-gray-100">
                  <Minus size={16} />
                </button>
                <span className="text-sm font-medium w-4 text-center">{item.qty}</span>
                <button onClick={() => updateCartQty(item.productId, item.variantId, item.qty + 1)} className="p-1 rounded-full hover:bg-gray-100">
                  <Plus size={16} />
                </button>
              </div>
              <button onClick={() => removeFromCart(item.productId, item.variantId)} className="text-red-500 p-2">
                <Trash2 size={18} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
        <div className="flex gap-2">
          <Input placeholder={t.couponCode} value={coupon} onChange={(e) => setCoupon(e.target.value)} />
          <Button variant="secondary" onClick={() => setApplied(coupon)}>{t.apply}</Button>
        </div>
        
        <div className="pt-4 space-y-2 text-sm">
          <div className="flex justify-between"><span>{t.subtotal}</span><span>₹{subtotal}</span></div>
          {discount > 0 && <div className="flex justify-between text-green-600"><span>{t.discount}</span><span>- ₹{discount}</span></div>}
          <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>{t.total} (excl. GST/Del)</span><span>₹{total}</span></div>
          <p className="text-xs text-gray-500 text-right mt-1">* {t.gst} & {t.delivery} calculated at checkout</p>
        </div>
        
        <Button className="w-full mt-4" onClick={() => navigate('/checkout', { state: { couponCode: applied } })}>{t.checkout}</Button>
      </div>
    </div>
  );
};

export const TrackOrder: React.FC = () => {
    const { orders, language } = useStore();
    const t = TRANSLATIONS[language];
    const [searchId, setSearchId] = useState('');
    const [searchMobile, setSearchMobile] = useState('');
    const [foundOrder, setFoundOrder] = useState<Order | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        const found = orders.find(o => 
            o.id === searchId.trim() && 
            o.customer.mobile.trim() === searchMobile.trim()
        );
        setFoundOrder(found || null);
        setHasSearched(true);
    };

    // Helper to determine active step
    const getStepStatus = (status: string) => {
        if (status === 'CANCELLED') return 'cancelled';
        if (status === 'DELIVERED') return 3; // Completed
        if (status === 'CONFIRMED') return 2;
        return 1; // Pending/Uploaded
    };

    const currentStep = foundOrder ? getStepStatus(foundOrder.status) : 0;

    return (
        <div className="container mx-auto px-4 py-8 max-w-lg animate-fade-in">
             <h1 className="text-2xl font-bold mb-6 text-center">{t.trackOrder}</h1>
             
             <form onSubmit={handleTrack} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                 <Input 
                    label={t.orderId} 
                    placeholder="e.g. 17092300123" 
                    value={searchId} 
                    onChange={e => setSearchId(e.target.value)} 
                    required
                 />
                 <Input 
                    label={t.mobile} 
                    placeholder="e.g. 9876543210" 
                    value={searchMobile} 
                    onChange={e => setSearchMobile(e.target.value)} 
                    required
                 />
                 <Button className="w-full flex items-center justify-center gap-2">
                     <Search size={18} /> {t.track}
                 </Button>
             </form>

             {hasSearched && !foundOrder && (
                 <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg text-center border border-red-100 flex flex-col items-center">
                     <XCircle size={32} className="mb-2"/>
                     {t.orderNotFound}
                 </div>
             )}

             {foundOrder && (
                 <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                     <div className="flex justify-between items-center border-b pb-4 mb-4">
                         <div>
                             <h3 className="font-bold text-lg">Order #{foundOrder.id}</h3>
                             <p className="text-xs text-gray-500">{new Date(foundOrder.date).toLocaleString()}</p>
                         </div>
                         <div className="text-right">
                             <p className="font-bold text-orange-600 text-lg">₹{foundOrder.total}</p>
                             <span className="text-xs bg-gray-100 px-2 py-1 rounded border">{foundOrder.items.length} Items</span>
                         </div>
                     </div>

                     {/* Status Timeline */}
                     {foundOrder.status === 'CANCELLED' ? (
                         <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center font-bold mb-6 border border-red-200">
                             🚫 {t.statusSteps.cancelled}
                         </div>
                     ) : (
                         <div className="relative flex justify-between items-center mb-8 px-2 mt-2">
                             {/* Progress Bar Background */}
                             <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                             {/* Progress Bar Fill */}
                             <div 
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 -z-10 transition-all duration-500"
                                style={{ width: currentStep === 3 ? '100%' : currentStep === 2 ? '50%' : '0%' }}
                             ></div>

                             {/* Step 1: Placed */}
                             <div className="flex flex-col items-center gap-2 bg-white">
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${typeof currentStep === 'number' && currentStep >= 1 ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                                     <PackageCheck size={16} />
                                 </div>
                                 <span className="text-xs font-medium text-gray-600">{t.statusSteps.placed}</span>
                             </div>

                             {/* Step 2: Confirmed */}
                             <div className="flex flex-col items-center gap-2 bg-white">
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${typeof currentStep === 'number' && currentStep >= 2 ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                                     <CheckCircle size={16} />
                                 </div>
                                 <span className="text-xs font-medium text-gray-600">{t.statusSteps.confirmed}</span>
                             </div>

                             {/* Step 3: Delivered */}
                             <div className="flex flex-col items-center gap-2 bg-white">
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${typeof currentStep === 'number' && currentStep >= 3 ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                                     <Truck size={16} />
                                 </div>
                                 <span className="text-xs font-medium text-gray-600">{t.statusSteps.delivered}</span>
                             </div>
                         </div>
                     )}

                     <h4 className="font-bold text-sm mb-2 text-gray-700">Items</h4>
                     <ul className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-4">
                         {foundOrder.items.map((item, i) => (
                             <li key={i} className="flex justify-between">
                                 <span>{item.productName} ({item.variant}) x{item.qty}</span>
                                 <span>₹{item.price * item.qty}</span>
                             </li>
                         ))}
                     </ul>

                     <h4 className="font-bold text-sm mb-2 text-gray-700">Delivery Address</h4>
                     <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                         {foundOrder.customer.name}<br/>
                         {foundOrder.customer.address}, {foundOrder.customer.landmark}<br/>
                         {foundOrder.customer.city}, {foundOrder.customer.state} - {foundOrder.customer.pincode}
                     </p>
                 </div>
             )}
        </div>
    );
};


export const Checkout: React.FC = () => {
  const { settings, getCartTotal, placeOrder, language } = useStore();
  const navigate = useNavigate();
  const couponCode = (window.history.state as any)?.usr?.couponCode || ''; 
  const t = TRANSLATIONS[language];
  
  const [details, setDetails] = useState<UserDetails>({
    name: '', mobile: '', email: '', houseNo: '', address: '', landmark: '', city: '', mandal: '', district: '', pincode: '', state: 'Telangana'
  });
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI'>('COD');
  const [screenshot, setScreenshot] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const { subtotal, discount, delivery, gst, total } = getCartTotal(couponCode);

  // Load saved details on mount
  useEffect(() => {
    const saved = localStorage.getItem('customer_details');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            setDetails(parsed);
        } catch (e) {
            console.error("Failed to load saved details", e);
        }
    }
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setScreenshot(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'UPI' && !screenshot) {
      alert("Please upload payment screenshot");
      return;
    }
    setLoading(true);
    
    // Save details for next time
    localStorage.setItem('customer_details', JSON.stringify(details));

    // 1. Create Order
    const order = await placeOrder(details, paymentMethod, screenshot, couponCode);

    // 2. Prepare WhatsApp Message
    const dateObj = new Date(order.date);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString();

    let msg = `*New Order #${order.id}*\n`;
    msg += `Store: ${settings.merchantName}\n`;
    msg += `Date: ${dateStr} at ${timeStr}\n`;
    msg += `----------------\n`;
    order.items.forEach(i => {
      msg += `${i.productName} (${i.variant}) x${i.qty}: ₹${i.price * i.qty}\n`;
    });
    msg += `----------------\n`;
    msg += `Sub: ₹${order.subtotal} | GST: ₹${order.gst} | Del: ₹${order.deliveryCharge}\n`;
    msg += `*Total: ₹${order.total}*\n`;
    msg += `----------------\n`;
    msg += `Customer: ${order.customer.name}, ${order.customer.mobile}\n`;
    msg += `${order.customer.address}, ${order.customer.city}\n`;
    msg += `Mandal: ${order.customer.mandal}, Dist: ${order.customer.district}\n`;
    
    if (paymentMethod === 'UPI') {
      msg += `\n✅ *Online Payment* (Screenshot Uploaded to Website)`;
    } else {
      msg += `\n📦 *COD Order* - Please confirm`;
    }

    const waLink = `https://wa.me/918985921477?text=${encodeURIComponent(msg)}`;

    // 3. Open WhatsApp Immediately
    window.open(waLink, '_blank');

    setLoading(false);
    
    // 4. Navigate to Success
    navigate(`/success/${order.id}`);
  };

  const upiLink = `upi://pay?pa=${settings.merchantVpa}&pn=${encodeURIComponent(settings.merchantName)}&am=${total}&tn=Order`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 mb-4 hover:text-orange-600 transition-colors"><ArrowLeft size={16} className="mr-1"/> Back</button>
      <h1 className="text-2xl font-bold mb-6">{t.checkout}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
          <h3 className="font-semibold border-b pb-2 mb-2">Shipping Details</h3>
          <Input label={t.name} required value={details.name} onChange={e => setDetails({...details, name: e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
             <Input label={t.mobile} required type="tel" value={details.mobile} onChange={e => setDetails({...details, mobile: e.target.value})} />
             <Input label="Email" type="email" value={details.email} onChange={e => setDetails({...details, email: e.target.value})} />
          </div>
          
          <Input label={t.houseNo} required value={details.houseNo} onChange={e => setDetails({...details, houseNo: e.target.value})} />
          <Input label={t.address} required value={details.address} onChange={e => setDetails({...details, address: e.target.value})} />
          <Input label={t.landmark} value={details.landmark} onChange={e => setDetails({...details, landmark: e.target.value})} />
          
          <div className="grid grid-cols-2 gap-3">
            <Input label={t.city} required value={details.city} onChange={e => setDetails({...details, city: e.target.value})} />
            <Input label={t.mandal} required value={details.mandal} onChange={e => setDetails({...details, mandal: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label={t.district} required value={details.district} onChange={e => setDetails({...details, district: e.target.value})} />
            <Input label={t.pincode} required value={details.pincode} onChange={e => setDetails({...details, pincode: e.target.value})} />
          </div>
          <Input label={t.state} required value={details.state} onChange={e => setDetails({...details, state: e.target.value})} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
          <h3 className="font-semibold border-b pb-2">Payment</h3>
          <div className="flex gap-4">
            {settings.allowCod && (
               <label className={`flex-1 border p-3 rounded-lg cursor-pointer flex items-center gap-2 ${paymentMethod === 'COD' ? 'border-orange-500 bg-orange-50' : ''}`}>
                 <input type="radio" name="pay" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                 {t.cod}
               </label>
            )}
            <label className={`flex-1 border p-3 rounded-lg cursor-pointer flex items-center gap-2 ${paymentMethod === 'UPI' ? 'border-orange-500 bg-orange-50' : ''}`}>
               <input type="radio" name="pay" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} />
               {t.upi}
            </label>
          </div>

          {paymentMethod === 'UPI' && (
            <div className="bg-gray-50 p-4 rounded text-center">
              <p className="font-bold text-lg mb-2">Amount to Pay: ₹{total}</p>
              <a href={upiLink} className="inline-block bg-orange-600 text-white px-6 py-2 rounded-full font-bold mb-4 hover:bg-orange-700">
                {t.payNow} (UPI App)
              </a>
              <div className="text-left border-t pt-4">
                <p className="text-sm font-semibold mb-2">{t.payNote}</p>
                <p className="text-xs text-gray-500 mb-2">{t.uploadScreenshot}:</p>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-100 transition-colors text-center cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" required />
                  <div className="flex flex-col items-center pointer-events-none">
                    <Upload size={24} className="text-gray-400 mb-2"/>
                    <span className="text-sm text-gray-500">{screenshot ? 'Screenshot Selected' : 'Click to Upload'}</span>
                  </div>
                </div>
                {screenshot && <img src={screenshot} alt="Preview" className="mt-2 h-20 object-contain mx-auto" />}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
           <div className="flex justify-between text-sm mb-1"><span>{t.subtotal}</span><span>₹{subtotal}</span></div>
           <div className="flex justify-between text-sm mb-1"><span>{t.delivery}</span><span>₹{delivery}</span></div>
           <div className="flex justify-between text-sm mb-1"><span>{t.gst} ({settings.gstPercent}%)</span><span>₹{gst}</span></div>
           {discount > 0 && <div className="flex justify-between text-sm mb-1 text-green-600"><span>{t.discount}</span><span>- ₹{discount}</span></div>}
           <div className="flex justify-between font-bold text-xl mt-3 border-t pt-2"><span>{t.total}</span><span>₹{total}</span></div>
        </div>

        <Button disabled={loading} className="w-full text-lg py-3">{loading ? 'Processing...' : (paymentMethod === 'COD' ? t.completeOrder : t.completeOrder)}</Button>
      </form>
    </div>
  );
};

export const Success: React.FC = () => {
  const { orders, language, settings } = useStore();
  const navigate = useNavigate();
  // Get latest order
  const order = orders[0]; 
  const t = TRANSLATIONS[language];

  if (!order) return <div className="p-8 text-center">No Order Found <Button onClick={() => navigate('/')}>Home</Button></div>;

  // Build fallback link in case auto-open blocked
  const dateObj = new Date(order.date);
  const dateStr = dateObj.toLocaleDateString();
  const timeStr = dateObj.toLocaleTimeString();

  let msg = `*New Order #${order.id}*\n`;
  msg += `Store: ${settings.merchantName}\n`;
  msg += `Date: ${dateStr} at ${timeStr}\n`;
  msg += `----------------\n`;
  order.items.forEach(i => {
    msg += `${i.productName} (${i.variant}) x${i.qty}: ₹${i.price * i.qty}\n`;
  });
  msg += `----------------\n`;
  msg += `Sub: ₹${order.subtotal} | GST: ₹${order.gst} | Del: ₹${order.deliveryCharge}\n`;
  msg += `*Total: ₹${order.total}*\n`;
  msg += `----------------\n`;
  msg += `Customer: ${order.customer.name}, ${order.customer.mobile}\n`;
  msg += `${order.customer.address}, ${order.customer.city}\n`;
  
  if (order.paymentMethod === 'UPI') {
    msg += `\n✅ *Online Payment* (Screenshot Uploaded to Website)`;
  } else {
    msg += `\n📦 *COD Order* - Please confirm`;
  }
  
  const waLink = `https://wa.me/918985921477?text=${encodeURIComponent(msg)}`;

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center text-center max-w-lg animate-fade-in">
      <div className="bg-green-100 p-6 rounded-full mb-8">
        <CheckCircle size={64} className="text-green-600" />
      </div>
      <h1 className="text-3xl font-bold mb-4 text-gray-800">{t.orderSuccess}</h1>
      <p className="text-gray-500 mb-8 text-lg">Thank you! Your order <strong>#{order.id}</strong> has been received.</p>
      
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 w-full mb-8">
         <p className="font-medium text-gray-700 mb-4">We have opened WhatsApp for you to send the order details.</p>
         <p className="text-sm text-gray-400 mb-4">If it didn't open automatically, click below:</p>
         
         <a 
           href={waLink} 
           target="_blank" 
           rel="noreferrer"
           className="flex items-center justify-center w-full bg-[#25D366] text-white font-bold py-3 rounded-lg hover:bg-[#20bd5a] transition-colors"
         >
           <MessageCircle className="w-5 h-5 mr-2" />
           Open WhatsApp Chat
         </a>
      </div>
      
      <Button variant="outline" onClick={() => navigate('/')} className="px-8">{t.continueShopping}</Button>
    </div>
  );
};
