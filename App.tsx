
import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { Home, Cart, Checkout, Success, TrackOrder } from './pages/Store';
import { AdminLogin, Dashboard, AdminProducts, AdminOrders, AdminSettings, AdminCoupons, AdminBanners } from './pages/Admin';
import { ShoppingCart, LayoutDashboard, Package, Settings, LogOut, Menu, X, TicketPercent, Image as ImageIcon, Truck } from 'lucide-react';
import { Language } from './types';

const NavBar: React.FC = () => {
  const { cart, language, toggleLanguage } = useStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  // Don't show public navbar on admin routes
  if (location.pathname.startsWith('/admin')) return null;

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Link to="/" className="text-2xl font-bold text-orange-600 tracking-tight font-serif">Ahaa! Masala</Link>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-orange-600 font-medium">Store</Link>
          <Link to="/track-order" className="text-gray-600 hover:text-orange-600 font-medium">Track Order</Link>
          <Link to="/admin" className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">Admin Panel</Link>
          <button 
            onClick={toggleLanguage} 
            className="text-sm font-medium border border-gray-200 px-3 py-1 rounded-full hover:border-orange-600 hover:text-orange-600 transition-colors"
          >
            {language === Language.EN ? 'తెలుగు' : 'English'}
          </button>
          
          <Link to="/cart" className="relative p-2 hover:bg-gray-50 rounded-full transition-colors group">
            <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-orange-600" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          <Link to="/cart" className="relative">
             <ShoppingCart className="w-6 h-6 text-gray-700" />
             {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center border border-white">
                {cartCount}
              </span>
            )}
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 absolute w-full left-0 top-16 shadow-lg py-4 px-4 flex flex-col gap-4">
           <Link to="/" onClick={() => setMobileMenuOpen(false)} className="font-medium text-gray-800">Store Home</Link>
           <Link to="/track-order" onClick={() => setMobileMenuOpen(false)} className="font-medium text-gray-800 flex items-center gap-2"><Truck size={18}/> Track Order</Link>
           <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="font-medium text-gray-500">Admin Panel</Link>
           <button onClick={() => { toggleLanguage(); setMobileMenuOpen(false); }} className="text-left font-medium text-gray-800">
             Switch Language ({language === Language.EN ? 'Telugu' : 'English'})
           </button>
        </div>
      )}
    </header>
  );
};

const AdminLayout: React.FC = () => {
  const { isAdmin, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAdmin) return <Navigate to="/admin/login" />;

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to Home Page
  };

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/coupons', icon: TicketPercent, label: 'Coupons' },
    { path: '/admin/banners', icon: ImageIcon, label: 'Banners' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="bg-white w-full md:w-64 border-r border-gray-200 flex-shrink-0">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
           <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
           <span className="font-bold text-gray-800">Admin Panel</span>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === item.path 
                  ? 'bg-orange-50 text-orange-600 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-8"
          >
            <LogOut size={20} />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <NavBar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success/:id" element={<Success />} />
          <Route path="/track-order" element={<TrackOrder />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
             <Route index element={<Navigate to="dashboard" />} />
             <Route path="dashboard" element={<Dashboard />} />
             <Route path="products" element={<AdminProducts />} />
             <Route path="coupons" element={<AdminCoupons />} />
             <Route path="banners" element={<AdminBanners />} />
             <Route path="orders" element={<AdminOrders />} />
             <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;
