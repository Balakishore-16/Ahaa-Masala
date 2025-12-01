
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, CartItem, Order, StoreSettings, Coupon, Banner, Language, OrderStatus, UserDetails } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS, INITIAL_BANNERS } from '../constants';
import { api } from '../utils/api';

interface StoreContextType {
  products: Product[];
  banners: Banner[];
  settings: StoreSettings;
  orders: Order[];
  coupons: Coupon[];
  cart: CartItem[];
  language: Language;
  isAdmin: boolean;
  
  // Actions
  toggleLanguage: () => void;
  addToCart: (productId: string, variantId: string, qty: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  updateCartQty: (productId: string, variantId: string, qty: number) => void;
  clearCart: () => void;
  
  // Admin Actions
  login: (u: string, p: string) => boolean;
  logout: () => void;
  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  updateSettings: (s: StoreSettings) => void;
  addCoupon: (c: Coupon) => void;
  toggleCoupon: (id: string) => void;
  addBanner: (b: Banner) => void;
  deleteBanner: (id: string) => void;
  toggleBanner: (id: string) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrderScreenshot: (id: string) => void;
  placeOrder: (details: UserDetails, paymentMethod: 'COD' | 'UPI', screenshot?: string, appliedCoupon?: string) => Promise<Order>;
  
  // Helpers
  getCartTotal: (couponCode?: string) => { subtotal: number; discount: number; delivery: number; gst: number; total: number; appliedCoupon?: Coupon };
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  // Initial State from LocalStorage (Sync) to prevent flash
  // We use a lazy initializer to avoid reading LS on every render
  const getLocal = <T,>(key: string, def: T): T => {
      try {
          const s = localStorage.getItem(key);
          return s ? JSON.parse(s) : def;
      } catch { return def; }
  };

  const [products, setProducts] = useState<Product[]>(() => getLocal('products', INITIAL_PRODUCTS));
  const [banners, setBanners] = useState<Banner[]>(() => getLocal('banners', INITIAL_BANNERS));
  const [settings, setSettings] = useState<StoreSettings>(() => getLocal('settings', INITIAL_SETTINGS));
  const [orders, setOrders] = useState<Order[]>(() => getLocal('orders', []));
  const [coupons, setCoupons] = useState<Coupon[]>(() => getLocal('coupons', [
    { id: 'c1', code: 'WELCOME50', type: 'FIXED', value: 50, maxUses: 100, usedCount: 0, active: true, isOneTime: false }
  ]));
  // Cart is usually local-only, but we can sync it too if we want a persistent cart across devices
  const [cart, setCart] = useState<CartItem[]>(() => getLocal('cart', []));
  
  const [language, setLanguage] = useState<Language>(Language.EN);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => !!localStorage.getItem('isAdmin'));

  // --- Synchronization Logic ---
  
  // 1. Initial Load & Background Sync with Server
  useEffect(() => {
    // Load remote data and update state if different
    api.load('products', INITIAL_PRODUCTS, setProducts);
    api.load('banners', INITIAL_BANNERS, setBanners);
    api.load('settings', INITIAL_SETTINGS, setSettings);
    api.load('orders', [], setOrders);
    api.load('coupons', [], setCoupons);
    api.load('cart', [], setCart); // Sync cart too

    // Polling interval to keep devices in sync (every 5 seconds)
    const interval = setInterval(() => {
        api.load('orders', [], setOrders);
        api.load('products', [], setProducts);
        // Also sync settings and banners so admin changes reflect immediately on clients
        api.load('settings', INITIAL_SETTINGS, setSettings);
        api.load('banners', [], setBanners);
        api.load('coupons', [], setCoupons);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 2. Cross-Tab Sync (Same Device)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'products') setProducts(JSON.parse(e.newValue || '[]'));
        if (e.key === 'banners') setBanners(JSON.parse(e.newValue || '[]'));
        if (e.key === 'settings') setSettings(JSON.parse(e.newValue || '{}'));
        if (e.key === 'orders') setOrders(JSON.parse(e.newValue || '[]'));
        if (e.key === 'coupons') setCoupons(JSON.parse(e.newValue || '[]'));
        if (e.key === 'cart') setCart(JSON.parse(e.newValue || '[]'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Helper to update State + LocalStorage + Server
  const updateAndSync = <T,>(key: string, newData: T, setter: React.Dispatch<React.SetStateAction<T>>) => {
      setter(newData);
      api.save(key, newData);
  };

  // --- Actions ---

  const toggleLanguage = () => setLanguage(prev => prev === Language.EN ? Language.TE : Language.EN);

  const addToCart = (productId: string, variantId: string, qty: number) => {
    const updatedCart = [...cart];
    const existing = updatedCart.find(item => item.productId === productId && item.variantId === variantId);
    
    if (existing) {
        existing.qty += qty;
    } else {
        updatedCart.push({ productId, variantId, qty });
    }
    updateAndSync('cart', updatedCart, setCart);
  };

  const removeFromCart = (productId: string, variantId: string) => {
    const updatedCart = cart.filter(i => !(i.productId === productId && i.variantId === variantId));
    updateAndSync('cart', updatedCart, setCart);
  };

  const updateCartQty = (productId: string, variantId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, variantId);
    } else {
      const updatedCart = cart.map(item => item.productId === productId && item.variantId === variantId ? { ...item, qty } : item);
      updateAndSync('cart', updatedCart, setCart);
    }
  };

  const clearCart = () => updateAndSync('cart', [], setCart);

  const login = (u: string, p: string) => {
    if (u === settings.adminUsername && p === settings.adminPasswordHash) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
  };

  const addProduct = (p: Product) => updateAndSync('products', [...products, p], setProducts);
  
  const updateProduct = (p: Product) => {
      const updated = products.map(prod => prod.id === p.id ? p : prod);
      updateAndSync('products', updated, setProducts);
  };
  
  const deleteProduct = (id: string) => {
      const updated = products.filter(p => p.id !== id);
      updateAndSync('products', updated, setProducts);
  };

  const updateSettings = (s: StoreSettings) => updateAndSync('settings', s, setSettings);

  const addCoupon = (c: Coupon) => updateAndSync('coupons', [...coupons, c], setCoupons);
  
  const toggleCoupon = (id: string) => {
      const updated = coupons.map(c => c.id === id ? { ...c, active: !c.active } : c);
      updateAndSync('coupons', updated, setCoupons);
  };
  
  const addBanner = (b: Banner) => updateAndSync('banners', [...banners, b], setBanners);
  
  const deleteBanner = (id: string) => {
      const updated = banners.filter(b => b.id !== id);
      updateAndSync('banners', updated, setBanners);
  };
  
  const toggleBanner = (id: string) => {
      const updated = banners.map(b => b.id === id ? { ...b, active: !b.active } : b);
      updateAndSync('banners', updated, setBanners);
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    updateAndSync('orders', updated, setOrders);
  };

  const deleteOrderScreenshot = (id: string) => {
    const updated = orders.map(o => o.id === id ? { ...o, paymentScreenshot: undefined, status: 'PENDING' as OrderStatus } : o);
    updateAndSync('orders', updated, setOrders);
  };

  const getCartTotal = (couponCode?: string) => {
    let subtotal = 0;
    cart.forEach(item => {
      const p = products.find(p => p.id === item.productId);
      const v = p?.variants.find(v => v.id === item.variantId);
      if (p && v) {
        subtotal += v.price * item.qty;
      }
    });

    let discount = 0;
    let appliedCoupon: Coupon | undefined;
    if (couponCode) {
      const c = coupons.find(cp => cp.code === couponCode && cp.active);
      if (c) {
        if (c.type === 'PERCENTAGE') {
          discount = (subtotal * c.value) / 100;
        } else {
          discount = c.value;
        }
        appliedCoupon = c;
      }
    }

    const delivery = subtotal > settings.freeDeliveryThreshold ? 0 : settings.deliveryCharge;
    const taxableAmount = Math.max(0, subtotal - discount);
    const gst = (taxableAmount * settings.gstPercent) / 100;
    const total = Math.max(0, taxableAmount + gst + delivery);

    return { subtotal, discount, delivery, gst, total, appliedCoupon };
  };

  const placeOrder = async (details: UserDetails, paymentMethod: 'COD' | 'UPI', screenshot?: string, appliedCouponCode?: string) => {
    const { subtotal, discount, delivery, gst, total, appliedCoupon } = getCartTotal(appliedCouponCode);
    
    const orderItems = cart.map(item => {
      const p = products.find(p => p.id === item.productId)!;
      const v = p.variants.find(v => v.id === item.variantId)!;
      return {
        productId: p.id,
        productName: p.name,
        variant: v.weight,
        price: v.price,
        qty: item.qty
      };
    });

    const newOrder: Order = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: orderItems,
      subtotal,
      gst,
      deliveryCharge: delivery,
      discount,
      total,
      customer: details,
      paymentMethod,
      status: paymentMethod === 'COD' ? 'PENDING' : 'PAYMENT_UPLOADED',
      paymentScreenshot: screenshot
    };

    const updatedOrders = [newOrder, ...orders];
    updateAndSync('orders', updatedOrders, setOrders);
    
    if (appliedCoupon) {
       const updatedCoupons = coupons.map(c => c.id === appliedCoupon.id ? {...c, usedCount: c.usedCount + 1} : c);
       updateAndSync('coupons', updatedCoupons, setCoupons);
    }

    clearCart();
    return newOrder;
  };

  return (
    <StoreContext.Provider value={{
      products, banners, settings, orders, coupons, cart, language, isAdmin,
      toggleLanguage, addToCart, removeFromCart, updateCartQty, clearCart,
      login, logout, addProduct, updateProduct, deleteProduct, updateSettings,
      addCoupon, toggleCoupon, addBanner, deleteBanner, toggleBanner, updateOrderStatus, 
      deleteOrderScreenshot, placeOrder, getCartTotal
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
