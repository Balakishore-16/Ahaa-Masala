
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Button, Input, Select, Modal, Badge } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, Users, ShoppingCart, Settings as SettingsIcon, Image as ImageIcon, Trash, Edit, Search, X, Calendar, Filter, Plus, TicketPercent, ArrowRight, ArrowLeft, Upload, Power, Eye, EyeOff, Link, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { Product, OrderStatus, Variant, Coupon, Banner } from '../types';
import { useNavigate } from 'react-router-dom';

export const AdminLogin: React.FC = () => {
  const { login, isAdmin } = useStore();
  const navigate = useNavigate();
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isAdmin, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(u, p)) {
        navigate('/admin/dashboard');
    } else {
        alert('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative animate-fade-in">
      <button onClick={() => navigate('/')} className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-orange-600 font-medium transition-colors">
        <ArrowLeft size={20} className="mr-1"/> Back to Store
      </button>
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <div className="bg-orange-600 p-3 rounded-xl shadow-lg">
             <Users className="text-white w-8 h-8" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Portal</h2>
        <div className="space-y-4">
          <Input placeholder="Username" value={u} onChange={e => setU(e.target.value)} className="bg-gray-50 border-gray-200" />
          <div className="relative">
            <Input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={p} 
              onChange={e => setP(e.target.value)} 
              className="bg-gray-50 border-gray-200 pr-10"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <Button className="w-full shadow-lg shadow-orange-200">Login to Dashboard</Button>
        </div>
      </form>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { orders, products, coupons } = useStore();
  const navigate = useNavigate();
  
  const revenue = orders.reduce((acc, o) => acc + o.total, 0);
  const pending = orders.filter(o => o.status === 'PENDING').length;
  
  const data = [
    { name: 'Pending', count: orders.filter(o => o.status === 'PENDING').length },
    { name: 'Paid', count: orders.filter(o => o.status === 'PAYMENT_UPLOADED').length },
    { name: 'Confirmed', count: orders.filter(o => o.status === 'CONFIRMED').length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border flex flex-col">
          <span className="text-gray-500">Total Revenue</span>
          <span className="text-2xl font-bold">₹{revenue}</span>
        </div>
        <div onClick={() => navigate('/admin/orders')} className="bg-white p-4 rounded-lg shadow border flex flex-col cursor-pointer hover:bg-gray-50 transition-colors">
          <span className="text-gray-500">Total Orders</span>
          <span className="text-2xl font-bold">{orders.length}</span>
        </div>
        <div onClick={() => navigate('/admin/orders')} className="bg-white p-4 rounded-lg shadow border flex flex-col cursor-pointer hover:bg-gray-50 transition-colors">
          <span className="text-gray-500">Pending Actions</span>
          <span className="text-2xl font-bold text-orange-600">{pending}</span>
        </div>
        <div onClick={() => navigate('/admin/products')} className="bg-white p-4 rounded-lg shadow border flex flex-col cursor-pointer hover:bg-gray-50 transition-colors">
          <span className="text-gray-500">Products</span>
          <span className="text-2xl font-bold">{products.length}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                  <Package className="text-orange-600" size={24}/>
                  <h3 className="font-bold text-lg">Products & Inventory</h3>
              </div>
              <p className="text-gray-500 mb-6 text-sm">Add new spices, update prices, manage quantity variants (e.g. 50g, 1kg), and control stock.</p>
              <Button onClick={() => navigate('/admin/products')} className="w-full flex justify-between items-center group">
                  Manage Products <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
              </Button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                  <TicketPercent className="text-blue-600" size={24}/>
                  <h3 className="font-bold text-lg">Coupons & Discounts</h3>
              </div>
              <p className="text-gray-500 mb-6 text-sm">Create percentage or fixed amount discount codes and manage their usage limits.</p>
              <Button onClick={() => navigate('/admin/coupons')} variant="secondary" className="w-full flex justify-between items-center group">
                  Manage Coupons <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
              </Button>
          </div>
      </div>
      
      {/* Chart */}
      <div className="bg-white p-4 rounded-lg shadow border h-64">
        <h3 className="font-bold mb-4">Order Status Overview</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#ea580c" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const AdminProducts: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partial<Product> | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = editItem as Product;
    // Validate
    if (!p.name || !p.variants || p.variants.length === 0) {
      alert("Name and at least one variant are required.");
      return;
    }

    if (p.id) updateProduct(p);
    else addProduct({ ...p, id: Date.now().toString(), variants: p.variants || [], active: true });
    setModalOpen(false);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditItem(prev => ({ ...prev!, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const addVariant = () => {
    const newVariant: Variant = { id: Date.now().toString(), weight: '', price: 0, stock: 100 };
    setEditItem(prev => ({ ...prev!, variants: [...(prev?.variants || []), newVariant] }));
  };

  const removeVariant = (index: number) => {
    setEditItem(prev => ({
      ...prev!,
      variants: prev!.variants!.filter((_, i) => i !== index)
    }));
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    setEditItem(prev => ({
      ...prev!,
      variants: prev!.variants!.map((v, i) => i === index ? { ...v, [field]: value } : v)
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => { 
          setEditItem({ name: '', description: '', variants: [{ id: 'v1', weight: '100g', price: 0, stock: 100 }] }); 
          setModalOpen(true); 
        }}>Add Product</Button>
      </div>

      <div className="grid gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white p-4 rounded-lg shadow border flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <img src={p.image} className="w-16 h-16 object-cover rounded bg-gray-100" alt={p.name} />
              <div>
                <h3 className="font-bold text-lg">{p.name}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                   {p.variants.map(v => (
                     <span key={v.id} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 border">
                        {v.weight} - ₹{v.price}
                     </span>
                   ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="px-2 py-1" onClick={() => { setEditItem(p); setModalOpen(true); }}><Edit size={16}/></Button>
              <Button variant="danger" className="px-2 py-1" onClick={() => deleteProduct(p.id)}><Trash size={16}/></Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editItem?.id ? "Edit Product" : "New Product"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name (English)" value={editItem?.name || ''} onChange={e => setEditItem({...editItem, name: e.target.value})} required />
          <Input label="Name (Telugu)" value={editItem?.nameTe || ''} onChange={e => setEditItem({...editItem, nameTe: e.target.value})} />
          <Input label="Description" value={editItem?.description || ''} onChange={e => setEditItem({...editItem, description: e.target.value})} />
          <div className="border p-3 rounded-lg bg-gray-50">
             <label className="text-sm font-bold mb-2 block">Product Image</label>
             <input type="file" onChange={handleImage} className="block w-full text-sm" />
             {editItem?.image && <img src={editItem.image} className="mt-2 h-20 w-20 object-cover rounded" alt="Preview" />}
          </div>
          
          <div className="bg-white border rounded-lg p-3">
             <div className="flex justify-between items-center mb-3">
               <h4 className="text-sm font-bold">Quantity Variants</h4>
               <Button type="button" onClick={addVariant} variant="outline" className="text-xs py-1 px-2 flex items-center gap-1">
                 <Plus size={14}/> Add Variant
               </Button>
             </div>
             
             <div className="space-y-2">
                {editItem?.variants?.map((v, idx) => (
                  <div key={idx} className="flex gap-2 items-start bg-gray-50 p-2 rounded">
                    <Input 
                      placeholder="Weight (e.g. 500g)" 
                      value={v.weight} 
                      onChange={e => updateVariant(idx, 'weight', e.target.value)}
                      className="text-sm"
                    />
                    <Input 
                      type="number" 
                      placeholder="Price (₹)" 
                      value={v.price} 
                      onChange={e => updateVariant(idx, 'price', Number(e.target.value))}
                      className="text-sm"
                    />
                    <Input 
                      type="number" 
                      placeholder="Stock" 
                      value={v.stock} 
                      onChange={e => updateVariant(idx, 'stock', Number(e.target.value))}
                      className="text-sm"
                    />
                    <button type="button" onClick={() => removeVariant(idx)} className="text-red-500 p-2 hover:bg-red-50 rounded">
                      <Trash size={16}/>
                    </button>
                  </div>
                ))}
                {(!editItem?.variants || editItem.variants.length === 0) && (
                   <p className="text-sm text-red-500 text-center py-2">At least one variant is required.</p>
                )}
             </div>
          </div>
          <Button className="w-full">Save Product</Button>
        </form>
      </Modal>
    </div>
  );
};

export const AdminCoupons: React.FC = () => {
  const { coupons, addCoupon, toggleCoupon } = useStore();
  const [isModalOpen, setModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '', type: 'PERCENTAGE', value: 0, maxUses: 100, isOneTime: false
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.value) return;

    addCoupon({
      id: Date.now().toString(),
      code: newCoupon.code.toUpperCase(),
      type: newCoupon.type as 'PERCENTAGE' | 'FIXED',
      value: Number(newCoupon.value),
      maxUses: Number(newCoupon.maxUses),
      isOneTime: !!newCoupon.isOneTime,
      usedCount: 0,
      active: true
    });
    setModalOpen(false);
    setNewCoupon({ code: '', type: 'PERCENTAGE', value: 0, maxUses: 100, isOneTime: false });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coupons & Discounts</h1>
        <Button onClick={() => setModalOpen(true)}>Create Coupon</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {coupons.map(c => (
          <div key={c.id} className={`p-4 rounded-lg border shadow-sm flex flex-col justify-between ${c.active ? 'bg-white' : 'bg-gray-50 opacity-75'}`}>
            <div className="flex justify-between items-start mb-2">
               <div>
                  <span className="font-mono font-bold text-lg bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-200">{c.code}</span>
                  <p className="text-sm text-gray-500 mt-1">
                    {c.type === 'PERCENTAGE' ? `${c.value}% OFF` : `₹${c.value} Flat OFF`}
                  </p>
               </div>
               <Badge color={c.active ? 'bg-green-500' : 'bg-gray-400'}>{c.active ? 'Active' : 'Inactive'}</Badge>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1 my-3">
               <p>Used: {c.usedCount} / {c.maxUses}</p>
               <p>Type: {c.isOneTime ? 'One-time use per user' : 'Multi-use'}</p>
            </div>

            <Button variant={c.active ? "secondary" : "primary"} onClick={() => toggleCoupon(c.id)} className="w-full text-sm">
              {c.active ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="New Coupon">
         <form onSubmit={handleAdd} className="space-y-4">
            <Input label="Coupon Code" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} required placeholder="e.g. SALE50" />
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Type</label>
                  <select 
                    className="w-full border rounded-lg px-3 py-2"
                    value={newCoupon.type} 
                    onChange={e => setNewCoupon({...newCoupon, type: e.target.value as any})}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
               </div>
               <Input label="Value" type="number" value={newCoupon.value} onChange={e => setNewCoupon({...newCoupon, value: Number(e.target.value)})} required />
            </div>
            <Input label="Max Uses" type="number" value={newCoupon.maxUses} onChange={e => setNewCoupon({...newCoupon, maxUses: Number(e.target.value)})} />
            
            <div className="flex items-center gap-2 border p-3 rounded-lg bg-gray-50">
               <input 
                 type="checkbox" 
                 id="onetime" 
                 checked={newCoupon.isOneTime} 
                 onChange={e => setNewCoupon({...newCoupon, isOneTime: e.target.checked})} 
                 className="w-4 h-4 text-orange-600"
               />
               <label htmlFor="onetime" className="text-sm font-medium">One-time use only</label>
            </div>
            
            <Button className="w-full">Create Coupon</Button>
         </form>
      </Modal>
    </div>
  );
};

export const AdminBanners: React.FC = () => {
    const { banners, addBanner, deleteBanner, toggleBanner } = useStore();
    const [isModalOpen, setModalOpen] = useState(false);
    const [newBanner, setNewBanner] = useState<Partial<Banner>>({ image: '', alt: '', order: 0 });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBanner.image) {
            alert("Image is required");
            return;
        }
        addBanner({
            id: Date.now().toString(),
            image: newBanner.image,
            alt: newBanner.alt || 'Banner',
            order: Number(newBanner.order) || 0,
            active: true
        });
        setModalOpen(false);
        setNewBanner({ image: '', alt: '', order: 0 });
    };

    const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setNewBanner(prev => ({ ...prev, image: reader.result as string }));
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Homepage Banners</h1>
                <Button onClick={() => setModalOpen(true)}>Add Banner</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {banners.sort((a,b) => a.order - b.order).map(b => (
                    <div key={b.id} className={`relative bg-white rounded-lg shadow-sm border overflow-hidden ${!b.active ? 'opacity-75' : ''}`}>
                        <img src={b.image} alt={b.alt} className="w-full h-40 object-cover" />
                        <div className="p-3 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-gray-800">{b.alt}</p>
                                <p className="text-xs text-gray-500">Order: {b.order}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant={b.active ? 'secondary' : 'primary'} className="text-xs py-1 px-2" onClick={() => toggleBanner(b.id)}>
                                    {b.active ? 'Disable' : 'Enable'}
                                </Button>
                                <Button variant="danger" className="text-xs py-1 px-2" onClick={() => deleteBanner(b.id)}>
                                    <Trash size={14}/>
                                </Button>
                            </div>
                        </div>
                        {!b.active && <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">Inactive</div>}
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Add Banner">
                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4 border border-blue-200 flex items-start gap-2">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <span>Recommended Size: <strong>1920 x 400 pixels</strong> for best display on all devices.</span>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold block">Image Source</label>
                        
                        <div className="border rounded-lg p-3 bg-gray-50">
                            <span className="text-xs text-gray-500 mb-2 block">Option 1: Paste Image URL</span>
                            <div className="flex gap-2">
                                <Link size={16} className="text-gray-400 mt-3" />
                                <Input 
                                    placeholder="https://example.com/image.jpg" 
                                    value={newBanner.image} 
                                    onChange={e => setNewBanner({...newBanner, image: e.target.value})} 
                                />
                            </div>
                        </div>

                        <div className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest">- OR -</div>

                        <div className="border rounded-lg p-3 bg-gray-50">
                             <span className="text-xs text-gray-500 mb-2 block">Option 2: Upload File</span>
                             <input type="file" onChange={handleImageFile} className="block w-full text-sm" accept="image/*" />
                        </div>
                    </div>

                    {newBanner.image && (
                        <div className="mt-2">
                            <p className="text-xs font-bold mb-1">Preview:</p>
                            <img src={newBanner.image} alt="Preview" className="w-full h-32 object-cover rounded border" />
                        </div>
                    )}

                    <Input label="Alt Text" value={newBanner.alt} onChange={e => setNewBanner({...newBanner, alt: e.target.value})} placeholder="e.g. Diwali Sale" />
                    <Input label="Display Order" type="number" value={newBanner.order} onChange={e => setNewBanner({...newBanner, order: Number(e.target.value)})} />
                    
                    <Button className="w-full">Add Banner</Button>
                </form>
            </Modal>
        </div>
    );
};

export const AdminOrders: React.FC = () => {
    const { orders, updateOrderStatus, settings, deleteOrderScreenshot } = useStore();
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
    // Helper for status badge colors
    const getStatusColor = (status: OrderStatus) => {
      switch(status) {
        case 'PENDING': return 'bg-amber-500';
        case 'PAYMENT_UPLOADED': return 'bg-blue-600';
        case 'CONFIRMED': return 'bg-emerald-600';
        case 'DELIVERED': return 'bg-indigo-600';
        case 'CANCELLED': return 'bg-rose-600';
        default: return 'bg-gray-500';
      }
    };
  
    // Helper for status text format
    const formatStatus = (s: string) => s.replace('_', ' ');
  
    const filteredOrders = orders.filter(o => {
      // 1. Status Filter
      if (filterStatus !== 'ALL' && o.status !== filterStatus) return false;
      
      // 2. Search Filter (Safe Navigation)
      const term = searchTerm.toLowerCase();
      const matchId = o.id.toLowerCase().includes(term);
      const matchName = (o.customer?.name || '').toLowerCase().includes(term);
      const matchMobile = (o.customer?.mobile || '').includes(term);
      const matchEmail = (o.customer?.email || '').toLowerCase().includes(term);
      
      if (searchTerm && !(matchId || matchName || matchMobile || matchEmail)) return false;
  
      // 3. Date Filter
      if (startDate) {
         const orderDate = new Date(o.date).setHours(0,0,0,0);
         const start = new Date(startDate).setHours(0,0,0,0);
         if (orderDate < start) return false;
      }
      if (endDate) {
         const orderDate = new Date(o.date).setHours(0,0,0,0);
         const end = new Date(endDate).setHours(0,0,0,0);
         if (orderDate > end) return false;
      }
  
      return true;
    }).sort((a, b) => {
        const d1 = new Date(a.date).getTime();
        const d2 = new Date(b.date).getTime();
        return sortOrder === 'desc' ? d2 - d1 : d1 - d2;
    });
  
    const tabs = ['ALL', 'PENDING', 'PAYMENT_UPLOADED', 'CONFIRMED', 'DELIVERED', 'CANCELLED'];
  
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <h1 className="text-2xl font-bold">Orders Management</h1>
           <div className="flex gap-2 bg-white p-1 rounded-lg border shadow-sm">
               <button onClick={() => setSortOrder('desc')} className={`px-3 py-1 text-xs font-bold rounded ${sortOrder === 'desc' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>Newest First</button>
               <button onClick={() => setSortOrder('asc')} className={`px-3 py-1 text-xs font-bold rounded ${sortOrder === 'asc' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>Oldest First</button>
           </div>
        </div>
        
        {/* Filters Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
             {/* Search Row */}
             <div className="flex gap-2">
                 <div className="relative flex-1">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                     <input 
                       type="text" 
                       placeholder="Search by Order ID, Name, Mobile or Email..." 
                       className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                       value={searchTerm}
                       onChange={e => setSearchTerm(e.target.value)}
                     />
                 </div>
                 {/* Date Pickers */}
                 <div className="flex gap-2">
                     <input type="date" className="border rounded-lg px-3 py-2 text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
                     <span className="self-center text-gray-400">-</span>
                     <input type="date" className="border rounded-lg px-3 py-2 text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
                 </div>
             </div>
  
             {/* Status Tabs */}
             <div className="flex overflow-x-auto pb-2 border-b border-gray-100 gap-6 no-scrollbar">
                 {tabs.map(tab => (
                     <button
                       key={tab}
                       onClick={() => setFilterStatus(tab)}
                       className={`whitespace-nowrap pb-2 text-sm font-bold border-b-2 transition-colors ${
                           filterStatus === tab 
                             ? 'border-orange-600 text-orange-600' 
                             : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                       }`}
                     >
                         {formatStatus(tab)}
                     </button>
                 ))}
             </div>
        </div>
  
        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed">
                  <Filter size={48} className="mx-auto mb-3 opacity-20" />
                  <p>No orders found matching your criteria.</p>
                  <button onClick={() => { setSearchTerm(''); setFilterStatus('ALL'); setStartDate(''); setEndDate(''); }} className="text-orange-600 font-bold mt-2 hover:underline">Clear Filters</button>
              </div>
          ) : (
              filteredOrders.map(order => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
                  {/* Header */}
                  <div className="bg-gray-50 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-3">
                          <span className="font-bold text-lg text-gray-800">#{order.id}</span>
                          <Badge color={getStatusColor(order.status)}>{formatStatus(order.status)}</Badge>
                          {order.paymentMethod === 'UPI' && <Badge color="bg-blue-500">UPI</Badge>}
                          {order.paymentMethod === 'COD' && <Badge color="bg-amber-600">COD</Badge>}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 flex items-center gap-4">
                          <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(order.date).toLocaleDateString()}</span>
                          <span>{new Date(order.date).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <select 
                          value={order.status} 
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="border rounded px-2 py-1 text-sm bg-white"
                        >
                          {tabs.filter(t => t !== 'ALL').map(s => <option key={s} value={s}>{formatStatus(s)}</option>)}
                        </select>
                        
                        {/* Send WhatsApp Update */}
                        <a 
                           href={`https://wa.me/91${order.customer.mobile}?text=${encodeURIComponent(`Update on Order #${order.id}: Your order is now ${formatStatus(order.status)}.`)}`}
                           target="_blank"
                           rel="noreferrer"
                           className="bg-[#25D366] text-white p-2 rounded hover:bg-[#20bd5a]"
                           title="Message Customer"
                        >
                           <ExternalLink size={16}/>
                        </a>
                    </div>
                  </div>
  
                  <div className="p-4 grid md:grid-cols-2 gap-6">
                      {/* Customer Info */}
                      <div>
                          <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><Users size={16}/> Customer</h4>
                          <p className="text-sm text-gray-600 font-medium">{order.customer.name}</p>
                          <p className="text-sm text-gray-500">{order.customer.mobile}</p>
                          <p className="text-sm text-gray-500 mt-1 bg-gray-50 p-2 rounded">
                            {order.customer.houseNo}, {order.customer.address}, {order.customer.landmark}<br/>
                            {order.customer.city}, {order.customer.mandal}<br/>
                            {order.customer.district}, {order.customer.state} - {order.customer.pincode}
                          </p>
                      </div>
  
                      {/* Items Info */}
                      <div>
                          <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><ShoppingCart size={16}/> Items</h4>
                          <ul className="text-sm space-y-1 bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
                              {order.items.map((item, idx) => (
                                  <li key={idx} className="flex justify-between border-b border-gray-100 last:border-0 pb-1 last:pb-0">
                                      <span>{item.productName} ({item.variant}) x{item.qty}</span>
                                      <span className="font-medium">₹{item.price * item.qty}</span>
                                  </li>
                              ))}
                          </ul>
                          <div className="flex justify-between font-bold text-gray-800 mt-2 pt-2 border-t">
                              <span>Total Amount</span>
                              <span>₹{order.total}</span>
                          </div>
                      </div>
                  </div>
  
                  {/* Payment Verification Section */}
                  {order.paymentScreenshot && (
                      <div className="bg-blue-50 border-t border-blue-100 p-4">
                          <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                             <ImageIcon size={18}/> Payment Verification
                          </h4>
                          <div className="flex flex-col md:flex-row gap-4">
                              <div className="bg-white p-2 rounded shadow-sm border">
                                  <img src={order.paymentScreenshot} alt="Payment Proof" className="h-48 object-contain cursor-pointer hover:scale-105 transition-transform" onClick={() => window.open(order.paymentScreenshot, '_blank')} />
                              </div>
                              <div className="flex-1 space-y-2 text-sm text-blue-900">
                                  <p><strong>Store:</strong> {settings.merchantName}</p>
                                  <p><strong>Uploaded:</strong> {new Date(order.date).toLocaleString()}</p>
                                  <p><strong>Customer ID:</strong> {order.customer.mobile}</p>
                                  <div className="pt-4 flex gap-3">
                                      <Button className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2" onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}>
                                          <Check size={16}/> Verify & Confirm
                                      </Button>
                                      <Button variant="danger" className="flex items-center gap-2" onClick={() => {
                                          if(window.confirm("Are you sure you want to delete this screenshot? The order status will revert to PENDING.")) {
                                              deleteOrderScreenshot(order.id);
                                          }
                                      }}>
                                          <Trash size={16}/> Delete Screenshot
                                      </Button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}
                </div>
              ))
          )}
        </div>
      </div>
    );
};

export const AdminSettings: React.FC = () => {
    const { settings, updateSettings } = useStore();
    const [localSettings, setLocalSettings] = useState(settings);
    const [passChange, setPassChange] = useState({ old: '', new: '' });
  
    const handleSave = () => {
      updateSettings(localSettings);
      alert("Settings Saved!");
    };
  
    const handlePassChange = (e: React.FormEvent) => {
       e.preventDefault();
       // Simple simulation check
       if (passChange.old === settings.adminPasswordHash) { // In real app, check hash
          updateSettings({ ...settings, adminPasswordHash: passChange.new });
          alert("Password updated successfully");
          setPassChange({ old: '', new: '' });
       } else {
          alert("Incorrect old password");
       }
    };
  
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Store Settings</h1>
        
        <div className="bg-white p-6 rounded-lg shadow border">
           <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><SettingsIcon size={20}/> General Configuration</h3>
           <div className="space-y-4">
              <Input label="Store Name" value={localSettings.merchantName} onChange={e => setLocalSettings({...localSettings, merchantName: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                  <Input label="GST Percentage (%)" type="number" value={localSettings.gstPercent} onChange={e => setLocalSettings({...localSettings, gstPercent: Number(e.target.value)})} />
                  <Input label="Delivery Charge (₹)" type="number" value={localSettings.deliveryCharge} onChange={e => setLocalSettings({...localSettings, deliveryCharge: Number(e.target.value)})} />
              </div>
              <Input label="Free Delivery Threshold (₹)" type="number" value={localSettings.freeDeliveryThreshold} onChange={e => setLocalSettings({...localSettings, freeDeliveryThreshold: Number(e.target.value)})} />
              <Input label="UPI Merchant VPA" value={localSettings.merchantVpa} onChange={e => setLocalSettings({...localSettings, merchantVpa: e.target.value})} />
              
              <div className="flex items-center gap-2 mt-4">
                  <input type="checkbox" id="cod" checked={localSettings.allowCod} onChange={e => setLocalSettings({...localSettings, allowCod: e.target.checked})} className="w-5 h-5 text-orange-600"/>
                  <label htmlFor="cod" className="font-medium">Enable Cash on Delivery (COD)</label>
              </div>
  
              <Button onClick={handleSave} className="mt-4">Save Changes</Button>
           </div>
        </div>
  
        <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Power size={20}/> Admin Access</h3>
            <form onSubmit={handlePassChange} className="space-y-4">
               <Input label="Change Username" value={localSettings.adminUsername} onChange={e => setLocalSettings({...localSettings, adminUsername: e.target.value})} />
               <div className="border-t pt-4 mt-2">
                   <p className="text-sm font-bold mb-3">Change Password</p>
                   <Input type="password" label="Old Password" value={passChange.old} onChange={e => setPassChange({...passChange, old: e.target.value})} className="mb-3" />
                   <Input type="password" label="New Password" value={passChange.new} onChange={e => setPassChange({...passChange, new: e.target.value})} />
               </div>
               <Button variant="secondary">Update Credentials</Button>
            </form>
        </div>
      </div>
    );
};
