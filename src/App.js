import React, { useState, useEffect } from 'react';
import './App.css';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query,
  where
} from "firebase/firestore";

// Make sure your image file is exactly named "ZenAxis Logo.png" inside the "src" folder!
import zaLogo from './ZenAxisLogo.png'; 

const defaultAdminUser = {
  id: 1, firstName: 'System', lastName: 'Admin', email: 'admin@gmail.com', phone: '01830976800', 
  address: 'ZenAxis HQ, Dhaka', password: 'admin123', role: 'admin'
};

const formatBDT = (amount) => "৳" + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const initialCategories = ["Components", "Peripherals", "Monitors", "Accessories"];

const initialProducts = [
  { 
    id: 1, name: "ZenAxis Quantum CPU", category: "Components", price: 55000, originalPrice: 65000, description: "Next-gen processing power.", isHotDeal: true, isFeatured: true,
    images: ["https://via.placeholder.com/800x800/0E5E60/ffffff?text=Quantum+CPU", "https://via.placeholder.com/800x800/168285/ffffff?text=CPU+Angle+2", "https://via.placeholder.com/800x800/073839/ffffff?text=CPU+Angle+3"],
    quickSpecs: "High-Precision ZenAxis Engineering\nAerospace-Grade Build Materials\nOptimized for Industrial Automation\n1-Year Comprehensive Warranty",
    longDescription: "Experience the pinnacle of industrial control with the ZenAxis Quantum CPU.\n\nManufactured in top-tier facilities, we ensure that every unit passes rigorous stress tests.",
    technicalSpecs: "Architecture: 5nm Quantum Node\nCores: 32-Core / 64-Thread\nBase Clock: 4.2 GHz",
    shippingInfo: "Ships within 24 hours from Dhaka Warehouse.\nStandard Delivery: 3-5 Business Days."
  },
  { 
    id: 2, name: "Neon Flux Keyboard", category: "Peripherals", price: 14500, originalPrice: 16500, description: "Mechanical keys with RGB sync.", isHotDeal: false, isFeatured: true,
    images: ["https://via.placeholder.com/800x800/0E5E60/ffffff?text=Neon+Keyboard", "https://via.placeholder.com/800x800/C89B3C/ffffff?text=Keyboard+Glow"],
    quickSpecs: "Tactile Mechanical Switches\nFull RGB Backlighting\nAircraft-Grade Aluminum Frame",
    longDescription: "The Neon Flux Keyboard is built for operators who need tactile feedback and extreme durability.",
    technicalSpecs: "Switch Type: ZenAxis Tactile Blue\nPolling Rate: 1000Hz\nWeight: 1.2kg",
    shippingInfo: "Ships within 48 hours.\nStandard Delivery: 3-5 Business Days."
  }
];


// 2. Navigation Bar
const Navbar = ({ view, setView, cartCount, loggedInUser, setLoggedInUser, isDarkMode, setIsDarkMode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (newView) => {
    setView(newView);
    setIsMobileMenuOpen(false); 
  };

  return (
    <header className="navbar">
      <div className="logo" onClick={() => handleNavClick('home')} style={{cursor: 'pointer'}}>
        <img src={zaLogo} alt="ZenAxis Automation" className="nav-logo-img" />
      </div>

      <button className="hamburger-menu" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <nav className={isMobileMenuOpen ? "nav-links open" : "nav-links"}>
        <button className={view === 'home' || view === 'product' ? 'active' : ''} onClick={() => handleNavClick('home')}>Home</button>
        <button className={view === 'services' ? 'active' : ''} onClick={() => handleNavClick('services')}>Services</button>
        <button className={view === 'cart' || view === 'checkout' ? 'active' : ''} onClick={() => handleNavClick('cart')}>
          Cart <span className="cart-badge">{cartCount}</span>
        </button>
        <button className={view === 'admin' ? 'active' : ''} onClick={() => handleNavClick('admin')}>
          {!loggedInUser ? 'Log In' : (loggedInUser.role === 'admin' ? 'Admin Panel' : 'My Account')}
        </button>
        {loggedInUser && view === 'admin' && (
          <button onClick={() => { setLoggedInUser(null); setIsMobileMenuOpen(false); }} style={{color: '#ff4757'}}>Logout</button>
        )}
        <button className="theme-toggle-icon" onClick={() => { setIsDarkMode(!isDarkMode); setIsMobileMenuOpen(false); }} title="Toggle Theme">
          {isDarkMode ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          )}
        </button>
      </nav>
    </header>
  );
};

// 3. Hero & Product Cards
const HeroSlider = ({ products, addToCart }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderProducts = products.filter(p => p.isFeatured).slice(0, 5); 
  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev) => (prev === sliderProducts.length - 1 ? 0 : prev + 1)), 4000);
    return () => clearInterval(timer);
  }, [sliderProducts.length]);
  if (sliderProducts.length === 0) return null;
  const product = sliderProducts[currentSlide];
  return (
    <div className="hero-slider">
      <div className="hero-content">
        <span className="featured-badge">Featured Product</span>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <div className="hero-price">{formatBDT(product.price)}</div>
        <button className="btn-gradient" onClick={() => addToCart(product)}>Add to Cart</button>
      </div>
      <div className="hero-image"><img src={product.images?.[0]} alt={product.name} /></div>
    </div>
  );
};

const ProductCard = ({ product, addToCart, onViewDetails }) => (
  <div className="product-card" onClick={() => onViewDetails(product)}>
    {product.isHotDeal && <div className="hot-badge">🔥 HOT DEAL</div>}
    <img src={product.images?.[0]} alt={product.name} />
    <div className="card-info">
      <span className="category-tag">{product.category || 'General'}</span>
      <h3>{product.name}</h3>
      <p className="description">{product.description}</p>
      <div className="price-row">
        <span className="price">{formatBDT(product.price)}</span>
        {product.originalPrice && <span className="old-price">{formatBDT(product.originalPrice)}</span>}
      </div>
      <button className="btn-outline" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>+ Add to Cart</button>
    </div>
  </div>
);

// 4. Product Details
const ProductDetails = ({ product, setView, addToCart }) => {
  const [activeTab, setActiveTab] = useState('overview'); 
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  if (!product) return null;
  const renderQuickSpecs = () => {
    if (!product.quickSpecs) return <li>✓ Standard Industrial Build</li>;
    return product.quickSpecs.split('\n').map((spec, index) => spec.trim() ? <li key={index}>✓ {spec}</li> : null);
  };
  
  return (
    <div className="product-details-page fade-in">
      <button className="btn-back" onClick={() => setView('home')}>← Back to Shop</button>
      <div className="details-layout-top">
        <div className="details-image-container">
          <img src={product.images?.[selectedImageIdx]} alt={product.name} className="details-main-img" />
          {product.isHotDeal && <div className="details-hot-badge">🔥 Limited Time Offer</div>}
          {product.images?.length > 1 && (
            <div className="thumbnail-gallery">
              {product.images.map((img, idx) => (
                <img key={idx} src={img} alt={`Thumb ${idx}`} className={idx === selectedImageIdx ? 'active-thumb' : ''} onClick={() => setSelectedImageIdx(idx)} />
              ))}
            </div>
          )}
        </div>
        <div className="details-short-info">
          <span className="category-tag">{product.category}</span>
          <h1 className="details-title">{product.name}</h1>
          <p className="details-subtitle">{product.description}</p>
          <div className="details-price-box">
            <span className="details-price">{formatBDT(product.price)}</span>
            {product.originalPrice && <span className="details-old-price">{formatBDT(product.originalPrice)}</span>}
          </div>
          <div className="details-specs-list"><h4>Quick Specifications:</h4><ul>{renderQuickSpecs()}</ul></div>
          <div className="details-actions">
            <button className="btn-gradient btn-large" onClick={() => addToCart(product)}>Add to Cart</button>
            <p className="stock-status">✅ In Stock & Ready to Ship</p>
          </div>
        </div>
      </div>
      <div className="details-layout-bottom">
        <div className="details-tabs">
          <button className={activeTab === 'overview' ? 'tab-active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={activeTab === 'tech' ? 'tab-active' : ''} onClick={() => setActiveTab('tech')}>Technical Specs</button>
          <button className={activeTab === 'shipping' ? 'tab-active' : ''} onClick={() => setActiveTab('shipping')}>Shipping</button>
        </div>
        <div className="details-long-text">
          {activeTab === 'overview' && <div className="fade-in"><h3>Product Overview</h3><p style={{ whiteSpace: 'pre-wrap' }}>{product.longDescription || "No detailed overview provided."}</p></div>}
          {activeTab === 'tech' && <div className="fade-in"><h3>Technical Specifications</h3><p style={{ whiteSpace: 'pre-wrap' }}>{product.technicalSpecs || "Technical specifications not available."}</p></div>}
          {activeTab === 'shipping' && <div className="fade-in"><h3>Shipping Information</h3><p style={{ whiteSpace: 'pre-wrap' }}>{product.shippingInfo || "Standard shipping rates apply."}</p></div>}
        </div>
      </div>
    </div>
  );
};

// 5. Home View
const Home = ({ products, categories, addToCart, onViewDetails }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const hotDeals = products.filter(p => p.isHotDeal);
  const regularProducts = products.filter(p => !p.isHotDeal);
  const displayedProducts = selectedCategory === 'All' ? regularProducts : regularProducts.filter(p => (p.category || 'General') === selectedCategory);
  
  return (
    <div className="home-view fade-in">
      <div className="shop-layout">
        <aside className="sidebar">
          <h3 className="sidebar-title">MENU CATEGORIES</h3>
          <div className="category-list">
            <button className={selectedCategory === 'All' ? 'active-cat' : ''} onClick={() => setSelectedCategory('All')}>All</button>
            {categories.map(cat => <button key={cat} className={selectedCategory === cat ? 'active-cat' : ''} onClick={() => setSelectedCategory(cat)}>{cat}</button>)}
          </div>
        </aside>
        <div className="shop-content">
          <HeroSlider products={products} addToCart={addToCart} />
          {hotDeals.length > 0 && selectedCategory === 'All' && (
            <section className="section">
              <h2 className="section-title"><span>🔥 Hot</span> Deals</h2>
              <div className="product-grid">{hotDeals.map(p => <ProductCard key={p.id} product={p} addToCart={addToCart} onViewDetails={onViewDetails} />)}</div>
            </section>
          )}
          <section className="section">
            <h2 className="section-title"><span>{selectedCategory}</span> Products</h2>
            <div className="product-grid">
              {displayedProducts.length > 0 ? displayedProducts.map(p => <ProductCard key={p.id} product={p} addToCart={addToCart} onViewDetails={onViewDetails} />) : <div className="empty-state glass-panel">No products found in this category.</div>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// --- SERVICES PAGE ---
const Services = () => {
  return (
    <div className="fade-in">
      <div style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '3rem' }}>
        <h2 className="section-title" style={{ borderBottom: 'none', display: 'inline-block' }}>
          <span>Machine</span> Servicing
        </h2>
        <p className="description" style={{ maxWidth: '700px', margin: '0 auto', fontSize: '1.1rem' }}>
          Keep your operations running smoothly. We provide expert repair, maintenance, and optimization for all types of industrial and maker machinery.
        </p>
      </div>
      
      <div className="product-grid" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2.5rem' }}>
        <div className="product-card glass-panel" style={{ alignItems: 'center', textAlign: 'center', paddingTop: '3rem', flex: '1 1 350px', maxWidth: '400px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚙️</div>
          <h3 style={{ color: 'var(--teal-main)', fontSize: '1.6rem', marginBottom: '1rem', fontWeight: '800' }}>CNC Machine Servicing</h3>
          <p className="description" style={{ minHeight: '80px' }}>Comprehensive diagnostics, spindle repair, axis calibration, and controller upgrades for all major CNC routing and milling brands.</p>
          <a href="https://wa.me/8801830976800" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', width: '100%' }}>
            <button className="btn-gradient" style={{ width: '100%', marginTop: '1rem' }}>Contact Engineer</button>
          </a>
        </div>
        <div className="product-card glass-panel" style={{ alignItems: 'center', textAlign: 'center', paddingTop: '3rem', flex: '1 1 350px', maxWidth: '400px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚡</div>
          <h3 style={{ color: 'var(--teal-main)', fontSize: '1.6rem', marginBottom: '1rem', fontWeight: '800' }}>Laser Cutting Machine</h3>
          <p className="description" style={{ minHeight: '80px' }}>Laser tube replacement, mirror alignment, lens cleaning, and power supply troubleshooting for CO2 and Fiber laser systems.</p>
          <a href="https://wa.me/8801830976800" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', width: '100%' }}>
            <button className="btn-gradient" style={{ width: '100%', marginTop: '1rem' }}>Contact Engineer</button>
          </a>
        </div>
        <div className="product-card glass-panel" style={{ alignItems: 'center', textAlign: 'center', paddingTop: '3rem', flex: '1 1 350px', maxWidth: '400px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🖨️</div>
          <h3 style={{ color: 'var(--teal-main)', fontSize: '1.6rem', marginBottom: '1rem', fontWeight: '800' }}>3D Printing Machine</h3>
          <p className="description" style={{ minHeight: '80px' }}>Extruder clearing, bed leveling calibration, firmware flashing, and stepper motor replacements for FDM and Resin printers.</p>
          <a href="https://wa.me/8801830976800" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', width: '100%' }}>
            <button className="btn-gradient" style={{ width: '100%', marginTop: '1rem' }}>Contact Engineer</button>
          </a>
        </div>
      </div>
    </div>
  );
};

// 6. Cart View
const Cart = ({ cart, removeFromCart, updateQuantity, setView }) => {
  const total = cart.reduce((sum, item) => sum + ((item?.price || 0) * (item?.quantity || 1)), 0);
  if (!cart || cart.length === 0) return (
    <div className="empty-state fade-in glass-panel">
      <h2>Your Cart is Empty</h2>
      <button className="btn-gradient" onClick={() => setView('home')} style={{marginTop: '1rem'}}>Go to Shop</button>
    </div>
  );
  return (
    <div className="cart-container fade-in glass-panel">
      <h2 className="admin-section-title">Shopping Cart</h2>
      <div className="cart-items">
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <img src={item.images?.[0]} alt={item.name} />
            <div className="item-details">
              <span className="category-tag">{item.category}</span>
              <h4>{item.name}</h4>
              <p className="item-price">{formatBDT(item.price)}</p>
            </div>
            <div className="item-controls">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
            </div>
            <button className="btn-remove" onClick={() => removeFromCart(item.id)}>✕</button>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <h3>Total: <span className="gradient-text">{formatBDT(total)}</span></h3>
        <button className="btn-gradient checkout-btn" onClick={() => setView('checkout')}>Proceed to Secure Checkout</button>
      </div>
    </div>
  );
};

// 7. Checkout System
const Checkout = ({ cart, setView, placeOrder, loggedInUser, showPopup }) => {
  const [formData, setFormData] = useState({ 
    name: loggedInUser ? `${loggedInUser.firstName} ${loggedInUser.lastName}` : '', phone: loggedInUser ? loggedInUser.phone : '', address: loggedInUser ? loggedInUser.address : '', paymentMethod: 'bKash', trxId: '' 
  });
  const total = cart.reduce((sum, item) => sum + ((item?.price || 0) * (item?.quantity || 1)), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!formData.trxId) return showPopup("Please provide the Transaction ID for verification.");
    placeOrder(formData, total);
  };

  return (
    <div className="checkout-container fade-in glass-panel">
      <button className="btn-back" onClick={() => setView('cart')}>← Back to Cart</button>
      <h2 className="admin-section-title">Secure Checkout</h2>
      <div className="checkout-layout">
        <form onSubmit={handleSubmit} className="checkout-form">
          <h3>Delivery Information</h3>
          <div className="form-col">
            <label>Full Name</label><input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <label>Phone Number</label><input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <label>Complete Delivery Address</label><textarea required rows="3" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
          <h3 style={{marginTop: '2rem'}}>Payment Method</h3>
          <div className="payment-options">
            <label className={`pay-card ${formData.paymentMethod === 'bKash' ? 'selected' : ''}`}><input type="radio" name="payment" value="bKash" checked={formData.paymentMethod === 'bKash'} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} />bKash</label>
            <label className={`pay-card ${formData.paymentMethod === 'Nagad' ? 'selected' : ''}`}><input type="radio" name="payment" value="Nagad" checked={formData.paymentMethod === 'Nagad'} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} />Nagad</label>
            <label className={`pay-card ${formData.paymentMethod === 'Bank' ? 'selected' : ''}`}><input type="radio" name="payment" value="Bank" checked={formData.paymentMethod === 'Bank'} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} />Bank Transfer</label>
          </div>
          <div className="payment-instructions form-col">
            {formData.paymentMethod === 'bKash' && <p>Send money to bKash Merchant: <strong>01830976800</strong></p>}
            {formData.paymentMethod === 'Nagad' && <p>Send money to Nagad Merchant: <strong>01830976800</strong></p>}
            {formData.paymentMethod === 'Bank' && <p>Transfer to: DBBL Bank, AC Name: ZenAxis, AC No: 123456789</p>}
            <label>Transaction ID / Reference Number</label><input type="text" required value={formData.trxId} onChange={e => setFormData({...formData, trxId: e.target.value})} />
          </div>
          <button type="submit" className="btn-gradient btn-large">Confirm Order ({formatBDT(total)})</button>
        </form>
        <div className="checkout-summary glass-panel">
          <h3>Order Summary</h3>
          {cart.map(item => (
            <div key={item.id} className="summary-item"><span>{item.quantity}x {item.name}</span><span>{formatBDT(item.price * item.quantity)}</span></div>
          ))}
          <div className="summary-total"><strong>Total Amount:</strong><span className="gradient-text" style={{fontSize: '1.5rem'}}>{formatBDT(total)}</span></div>
        </div>
      </div>
    </div>
  );
};

// 8. Authentication System
const AuthPage = ({ users, setUsers, onLogin, showPopup }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [regData, setRegData] = useState({ firstName: '', lastName: '', address: '', phone: '', email: '', password: '', confirmPassword: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    // Use the users state which is now synced with Firestore
    const validUser = users.find(u => u.email === loginEmail && u.password === loginPass);
    if (validUser) {
      onLogin(validUser);
    } else {
      showPopup('ACCESS DENIED: Invalid email or password.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regData.password !== regData.confirmPassword) return showPopup("Passwords do not match!");
    if (regData.password.length < 6) return showPopup('Password must be at least 6 characters.');
    if (users.find(u => u.email === regData.email)) return showPopup('An account with this email already exists!');
    const newUser = { firstName: regData.firstName, lastName: regData.lastName, address: regData.address, phone: regData.phone, email: regData.email, password: regData.password, role: 'customer' };
    
    try {
      await addDoc(collection(db, "users"), newUser);
      showPopup('Account created successfully! You can now log in.');
      setIsLoginView(true); setLoginEmail(regData.email);
    } catch (err) {
      showPopup("Registration Error: " + err.message);
    }
  };

  return (
    <div className="auth-page-wrapper fade-in">
      <div className={`admin-login glass-panel ${!isLoginView ? 'register-box' : ''}`}>
        <h2 style={{ textTransform: 'uppercase', letterSpacing: '2px', marginTop: '0.5rem' }}>{isLoginView ? 'System Access' : 'Create Account'}</h2>
        <p className="sub-text">{isLoginView ? 'Secure encrypted portal for ZenAxis Store' : 'Join our industrial automation community'}</p>
        {isLoginView ? (
        <form onSubmit={handleLogin} className="form-col">
          <label>Email Address</label>
          <input type="email" placeholder="Enter your email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
          <label>Access Password</label>
          <input type="password" placeholder="Enter your password" value={loginPass} onChange={e => setLoginPass(e.target.value)} required />
          <button type="submit" className="btn-gradient" style={{width: '100%'}}>Authorize Access</button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="form-col">
          <div className="row">
            <div className="col"><label>First Name</label><input type="text" placeholder="e.g. John" value={regData.firstName} onChange={e => setRegData({...regData, firstName: e.target.value})} required /></div>
            <div className="col"><label>Last Name</label><input type="text" placeholder="e.g. Doe" value={regData.lastName} onChange={e => setRegData({...regData, lastName: e.target.value})} required /></div>
          </div>
          <label>Email Address</label>
          <input type="email" placeholder="john@example.com" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} required />
          <label>Phone Number</label>
          <input type="tel" placeholder="01XXX-XXXXXX" value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} required />
          <label>Delivery Address</label>
          <textarea rows="2" placeholder="Full shipping address" value={regData.address} onChange={e => setRegData({...regData, address: e.target.value})} required />
          <div className="row">
            <div className="col"><label>Password</label><input type="password" placeholder="Min 6 chars" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} required /></div>
            <div className="col"><label>Confirm</label><input type="password" placeholder="Re-type" value={regData.confirmPassword} onChange={e => setRegData({...regData, confirmPassword: e.target.value})} required /></div>
          </div>
          <button type="submit" className="btn-gradient" style={{width: '100%', marginTop: '10px'}}>Complete Registration</button>
        </form>
      )}
      <div style={{marginTop: '2rem', fontSize: '0.9rem', color: '#888'}}>
        {isLoginView ? "Don't have an account? " : "Already have an account? "}
        <button className="btn-text edit" style={{ color: 'var(--gold-main)' }} onClick={() => setIsLoginView(!isLoginView)}>{isLoginView ? 'Initialize Setup' : 'Login Now'}</button>
      </div>
    </div>
  </div>
  );
};

// 9A. CUSTOMER DASHBOARD
const CustomerDashboard = ({ loggedInUser, setLoggedInUser, orders, users, setUsers, showPopup }) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [editData, setEditData] = useState({ ...loggedInUser });
  const myOrders = orders.filter(o => o.customerEmail === loggedInUser.email);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if(editData.password.length < 6) return showPopup('Password must be at least 6 characters.');
    
    try {
      const { id, ...uData } = editData;
      await updateDoc(doc(db, "users", id), uData);
      setLoggedInUser(editData);
      showPopup('Profile updated successfully!');
    } catch (err) {
      showPopup("Profile Update Error: " + err.message);
    }
  };

  return (
    <div className="admin-dashboard fade-in">
      <div className="admin-header glass-panel" style={{padding: '1.5rem', marginBottom: '2rem'}}>
        <div className="admin-user-info">
          <h2 className="admin-section-title" style={{margin: 0}}>My Account</h2>
          <div className="user-details">
            <span className="user-name">Welcome back, {loggedInUser.firstName} {loggedInUser.lastName}</span>
            <span className="user-email">{loggedInUser.email}</span>
          </div>
        </div>
        <div className="admin-nav-tabs">
          <button className={activeTab === 'orders' ? 'tab-active' : ''} onClick={() => setActiveTab('orders')}>My Orders</button>
          <button className={activeTab === 'profile' ? 'tab-active' : ''} onClick={() => setActiveTab('profile')}>Account Settings</button>
        </div>
      </div>
      {activeTab === 'orders' && (
        <div className="glass-panel table-responsive fade-in">
          <h3 className="admin-section-title" style={{padding: '0 1rem'}}>Order History</h3>
          {myOrders.length === 0 ? <p style={{padding: '2rem', textAlign: 'center', color: '#666'}}>You have no previous orders.</p> : (
            <table className="admin-table">
              <thead><tr><th>Order ID / Date</th><th>Items</th><th>Total / Payment</th><th>Status</th></tr></thead>
              <tbody>
                {[...myOrders].reverse().map(order => (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong><br/><span style={{fontSize:'0.8rem', color:'#888'}}>{order.date}</span></td>
                    <td>{order.items.map(i => <div key={i.id} style={{fontSize:'0.85rem'}}>• {i.quantity}x {i.name}</div>)}</td>
                    <td><strong>{formatBDT(order.total)}</strong><br/><span className="category-tag">{order.customer.paymentMethod}</span></td>
                    <td><strong>{order.status}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {activeTab === 'profile' && (
         <div className="glass-panel fade-in" style={{padding: '2rem'}}>
           <h3 className="admin-section-title">Edit Profile Information</h3>
           <form onSubmit={handleUpdateProfile} className="form-col">
              <div className="row"><div className="col"><label>First Name</label><input type="text" value={editData.firstName} onChange={e => setEditData({...editData, firstName: e.target.value})} required /></div><div className="col"><label>Last Name</label><input type="text" value={editData.lastName} onChange={e => setEditData({...editData, lastName: e.target.value})} required /></div></div>
              <label>Phone Number</label><input type="tel" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} required />
              <label>Delivery Address</label><textarea rows="3" value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} required />
              <label>Change Password</label><input type="text" value={editData.password} onChange={e => setEditData({...editData, password: e.target.value})} required />
              <button type="submit" className="btn-gradient">Save Changes</button>
           </form>
         </div>
      )}
    </div>
  );
};

// 9B. MASTER ADMIN PANEL
const AdminPanel = ({ products, setProducts, loggedInUser, categories, setCategories, orders, updateOrderStatus, users, showPopup }) => {
  const [activeTab, setActiveTab] = useState('orders'); 
  const [editingProduct, setEditingProduct] = useState(null);
  const [newCatName, setNewCatName] = useState("");

  const handleAddNew = () => {
    const defaultCat = categories.length > 0 ? categories[0] : "General";
    setEditingProduct({ id: Date.now(), name: '', category: defaultCat, price: '', description: '', longDescription: '', quickSpecs: '', technicalSpecs: '', shippingInfo: '', isHotDeal: false, isFeatured: false, images: [] });
  };
  const handleSave = async () => {
    if (!editingProduct.name || !editingProduct.price) return showPopup("Name and Price are required!");
    if (!editingProduct.images || editingProduct.images.length === 0) return showPopup("Please upload at least 1 image!");
    
    try {
      const { id, ...pData } = editingProduct;
      const productToSave = { ...pData, price: Number(pData.price), originalPrice: pData.originalPrice ? Number(pData.originalPrice) : null };
      
      if (products.find(p => p.id === id)) {
        await updateDoc(doc(db, "products", id), productToSave);
      } else {
        await addDoc(collection(db, "products"), productToSave);
      }
      setEditingProduct(null);
    } catch (err) {
      showPopup("Save Error: " + err.message);
    }
  };

  const handleDelete = async (id) => { 
    if(window.confirm("Delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (err) {
        showPopup("Delete Error: " + err.message);
      }
    }
  };

  const handleAddCategory = async () => { 
    if(newCatName.trim() && !categories.includes(newCatName.trim())) { 
      try {
        await addDoc(collection(db, "categories"), { name: newCatName.trim() });
        setNewCatName(""); 
      } catch (err) {
        showPopup("Add Category Error: " + err.message);
      }
    }
  };

  const handleRemoveCategory = async (catToRemove) => { 
    if(window.confirm(`Delete category "${catToRemove}"?`)) {
      try {
        const q = query(collection(db, "categories"), where("name", "==", catToRemove));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (d) => {
          await deleteDoc(doc(db, "categories", d.id));
        });
      } catch (err) {
        showPopup("Delete Category Error: " + err.message);
      }
    }
  };

  const handleMultipleImages = (e) => {
    const files = Array.from(e.target.files);
    if ((editingProduct.images?.length || 0) + files.length > 10) return showPopup("Maximum 10 images allowed per product.");
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scaleSize = 500 / img.width;
          canvas.width = 500; canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setEditingProduct(prev => ({ ...prev, images: [...(prev.images || []), dataUrl] }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    setEditingProduct(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== indexToRemove) }));
  };

  if (editingProduct) {
    return (
      <div className="admin-editor fade-in glass-panel">
        <h2 className="admin-section-title">{products.find(p => p.id === editingProduct.id) ? 'Edit Product Details' : 'Add New Product'}</h2>
        <div className="editor-grid">
          <div className="image-col">
            <div className="admin-image-preview-grid">
              {(editingProduct.images || []).map((img, idx) => (
                <div key={idx} className="admin-img-wrap">
                  <img src={img} alt={`Preview ${idx}`} />
                  <button className="admin-img-remove" onClick={() => handleRemoveImage(idx)}>×</button>
                </div>
              ))}
            </div>
            <label className="btn-outline" style={{display: 'block', textAlign: 'center', marginTop: '1rem', cursor: 'pointer'}}>
              Upload Product Images (Max 10) <input type="file" multiple accept="image/*" onChange={handleMultipleImages} hidden />
            </label>
            <p className="sub-text" style={{textAlign: 'center', fontSize: '0.8rem', marginTop: '10px'}}>You have {editingProduct.images?.length || 0}/10 images.</p>
          </div>
          <div className="form-col">
            <div className="row">
              <div className="col" style={{flex: 2}}><label>Product Name</label><input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} /></div>
              <div className="col" style={{flex: 1}}><label>Category</label><select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="category-dropdown">{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
            </div>
            <div className="row">
              <div className="col"><label>Current Price (৳)</label><input type="number" step="1" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || ''})} /></div>
              <div className="col"><label>Original Price (৳) - Optional</label><input type="number" step="1" value={editingProduct.originalPrice || ''} onChange={e => setEditingProduct({...editingProduct, originalPrice: parseFloat(e.target.value) || null})} /></div>
            </div>
            <label>Short Description (Main Card Text)</label><input type="text" value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
            <label>Quick Specifications</label><textarea rows="4" value={editingProduct.quickSpecs || ''} onChange={e => setEditingProduct({...editingProduct, quickSpecs: e.target.value})} />
            <label>Overview Tab</label><textarea rows="5" value={editingProduct.longDescription || ''} onChange={e => setEditingProduct({...editingProduct, longDescription: e.target.value})} />
            <label>Technical Specs Tab</label><textarea rows="4" value={editingProduct.technicalSpecs || ''} onChange={e => setEditingProduct({...editingProduct, technicalSpecs: e.target.value})} />
            <label>Shipping Info Tab</label><textarea rows="3" value={editingProduct.shippingInfo || ''} onChange={e => setEditingProduct({...editingProduct, shippingInfo: e.target.value})} />
            <label className="checkbox-label"><input type="checkbox" checked={editingProduct.isHotDeal} onChange={e => setEditingProduct({...editingProduct, isHotDeal: e.target.checked})} /> Mark as "Hot Deal" 🔥</label>
            <label className="checkbox-label"><input type="checkbox" checked={editingProduct.isFeatured} onChange={e => setEditingProduct({...editingProduct, isFeatured: e.target.checked})} /> Show in Hero Slider (Featured) 🌟</label>
            <div className="action-buttons"><button className="btn-gradient" onClick={handleSave}>Save Product</button><button className="btn-outline" onClick={() => setEditingProduct(null)}>Cancel</button></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard fade-in">
      <div className="admin-header glass-panel" style={{padding: '1.5rem', marginBottom: '2rem'}}>
        <div className="admin-user-info">
          <h2 className="admin-section-title" style={{margin: 0}}>Master Dashboard</h2>
          <div className="user-details">
            <span className="user-name">Welcome, {loggedInUser.firstName} {loggedInUser.lastName}</span>
            <span className="user-email">{loggedInUser.email}</span>
          </div>
        </div>
        <div className="admin-nav-tabs">
          <button className={activeTab === 'orders' ? 'tab-active' : ''} onClick={() => setActiveTab('orders')}>Orders</button>
          <button className={activeTab === 'products' ? 'tab-active' : ''} onClick={() => setActiveTab('products')}>Products</button>
          <button className={activeTab === 'categories' ? 'tab-active' : ''} onClick={() => setActiveTab('categories')}>Categories</button>
          <button className={activeTab === 'users' ? 'tab-active' : ''} onClick={() => setActiveTab('users')}>Users</button>
        </div>
      </div>

      {activeTab === 'orders' && (
        <div className="glass-panel table-responsive fade-in">
          <h3 className="admin-section-title" style={{padding: '0 1rem'}}>All Customer Orders</h3>
          {orders.length === 0 ? <p style={{padding: '2rem', textAlign: 'center', color: '#666'}}>No orders have been placed yet.</p> : (
            <table className="admin-table">
              <thead><tr><th>Order ID / Date</th><th>Customer Info</th><th>Items</th><th>Total / Payment</th><th>Status</th></tr></thead>
              <tbody>
                {[...orders].reverse().map(order => (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong><br/><span style={{fontSize:'0.8rem', color:'#888'}}>{order.date}</span></td>
                    <td><strong>{order.customer.name}</strong><br/>{order.customer.phone}<br/><span style={{fontSize:'0.8rem'}}>{order.customer.address}</span></td>
                    <td>{order.items.map(i => <div key={i.id} style={{fontSize:'0.85rem'}}>• {i.quantity}x {i.name}</div>)}</td>
                    <td><strong>{formatBDT(order.total)}</strong><br/><span className="category-tag">{order.customer.paymentMethod}</span><br/><span style={{fontSize:'0.8rem'}}>Trx: {order.customer.trxId}</span></td>
                    <td>
                      <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} className="category-dropdown" style={{padding: '5px', marginBottom: 0, width: 'auto'}}>
                        <option value="Pending">🟡 Pending</option>
                        <option value="Shipped">🔵 Shipped</option>
                        <option value="Completed">🟢 Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div className="glass-panel table-responsive fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
            <h3 className="admin-section-title" style={{ margin: 0 }}>Product Catalog</h3>
            <button className="btn-gradient" onClick={handleAddNew}>+ Add New Product</button>
          </div>
          <table className="admin-table">
            <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td><img src={p.images?.[0]} alt={p.name} className="table-img" /></td>
                  <td><strong>{p.name}</strong></td>
                  <td><span className="category-tag">{p.category || 'General'}</span></td>
                  <td>{formatBDT(p.price)}</td>
                  <td><button className="btn-text edit" onClick={() => setEditingProduct(p)}>Edit</button><button className="btn-text delete" onClick={() => handleDelete(p.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="glass-panel table-responsive fade-in">
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
            <h3 className="admin-section-title" style={{ margin: 0 }}>System Categories</h3>
            <p className="sub-text" style={{ marginBottom: '1.5rem' }}>Manage high-level navigation categories for the storefront.</p>
            <div className="cat-add-row" style={{ display: 'flex', gap: '10px' }}>
              <input type="text" placeholder="Industrial Category Name..." value={newCatName} onChange={(e) => setNewCatName(e.target.value)} style={{ flexGrow: 1, marginBottom: 0 }} />
              <button className="btn-gradient" onClick={handleAddCategory} style={{ padding: '0 25px', height: '44px' }}>Add Category</button>
            </div>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c}>
                  <td><strong>{c}</strong></td>
                  <td><span className="category-tag" style={{ background: 'rgba(14, 94, 96, 0.1)', color: 'var(--teal-main)' }}>Active</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-text delete" onClick={() => handleRemoveCategory(c)} style={{ color: '#ff4757' }}>Remove System Entry</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="glass-panel table-responsive fade-in">
          <h3 className="admin-section-title" style={{padding: '0 1rem'}}>Registered Accounts</h3>
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone & Address</th><th>Role</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><span style={{fontSize:'0.8rem', color:'#888'}}>#{u.id}</span></td>
                  <td><strong>{u.firstName} {u.lastName}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.phone}<br/><span style={{fontSize:'0.8rem'}}>{u.address}</span></td>
                  <td><span className="category-tag" style={u.role==='admin'?{background:'var(--teal-main)',color:'white',borderColor:'transparent'}:{}}>{u.role}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// 10. Footer Component (NEW SOCIAL ICONS)
const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-brand">
        <img src={zaLogo} alt="ZenAxis Automation" className="footer-logo" />
        <p>Leading the future of automation technology. High-precision CNC components and smart peripherals.</p>
        
        {/* NEW SOCIAL MEDIA ICONS */}
        <div className="social-icons">
          <a href="https://www.facebook.com/share/1KxFKsVsQ7/" target="_blank" rel="noopener noreferrer" title="Facebook">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" title="LinkedIn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
          </a>
          <a href="https://wa.me/8801830976800" target="_blank" rel="noopener noreferrer" title="WhatsApp">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          </a>
        </div>
      </div>
      <div className="footer-links">
        <h3>Contact Us</h3>
        <p><strong>Email:</strong> zenaxisautomation@gmail.com</p>
        <p><strong>WhatsApp:</strong> +880 1830976800</p>
        <p><strong>Location:</strong> Dhaka, Bangladesh</p>
      </div>
    </div>
    <div className="footer-bottom">&copy; {new Date().getFullYear()} ZenAxis Automation. All Rights Reserved.</div>
  </footer>
);

// 11. Main App Wrapper
export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('zen_cart_v15')) || []);
  const [orders, setOrders] = useState([]); 
  const [users, setUsers] = useState([]); 
  
  const [isDarkMode, setIsDarkMode] = useState(() => JSON.parse(localStorage.getItem('zen_darkmode')) || false);
  const [view, setView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [popupMsg, setPopupMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const showPopup = (msg) => setPopupMsg(msg);

  // REAL-TIME FIRESTORE SYNC
  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const pData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setProducts(pData);
    });
    const unsubCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
      const cData = snapshot.docs.map(doc => doc.data().name);
      setCategories(cData);
    });
    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const oData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setOrders(oData);
    });
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const uData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setUsers(uData);
      setLoading(false);
    });

    return () => { unsubProducts(); unsubCategories(); unsubOrders(); unsubUsers(); };
  }, []);

  // INITIAL DATA SEEDING (Run once if empty)
  useEffect(() => {
    if (!loading && categories.length === 0) {
      initialCategories.forEach(async (cat) => {
        await addDoc(collection(db, "categories"), { name: cat });
      });
    }
    if (!loading && users.length === 0) {
      setDoc(doc(db, "users", "admin-default"), defaultAdminUser);
    }
    if (!loading && products.length === 0) {
      initialProducts.forEach(async (p) => {
        const { id, ...pWithoutId } = p;
        await addDoc(collection(db, "products"), pWithoutId);
      });
    }
  }, [loading]);

  useEffect(() => localStorage.setItem('zen_cart_v15', JSON.stringify(cart)), [cart]);
  
  useEffect(() => {
    localStorage.setItem('zen_darkmode', JSON.stringify(isDarkMode));
    if (isDarkMode) document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode');
  }, [isDarkMode]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    showPopup(`${product.name} added to cart!`);
  };
  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return removeFromCart(id);
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
  };
  const handleViewDetails = (product) => { setSelectedProduct(product); setView('product'); window.scrollTo(0, 0); };

  const placeOrder = async (customerDetails, totalAmount) => {
    const newOrder = {
      date: new Date().toLocaleDateString(),
      customerEmail: loggedInUser ? loggedInUser.email : 'Guest', 
      customer: customerDetails,
      items: cart.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })), // Clean items for DB
      total: totalAmount,
      status: 'Pending',
      createdAt: new Date()
    };
    try {
      const docRef = await addDoc(collection(db, "orders"), newOrder);
      setCart([]);
      showPopup(`Order Placed Successfully! Your Order ID is #${docRef.id.substring(0,6).toUpperCase()}`);
      setView('home');
    } catch (e) {
      showPopup("Order Error: " + e.message);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    await updateDoc(doc(db, "orders", orderId), { status: newStatus });
  };

  if (loading) return <div className="empty-state"><h3>Initializing Industrial Backend...</h3></div>;

  return (
    <div className="App">
      <Navbar view={view} setView={setView} cartCount={cart.reduce((a, b) => a + (b.quantity || 1), 0)} loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      <main className="container main-content">
        {view === 'home' && <Home products={products} categories={categories} addToCart={addToCart} onViewDetails={handleViewDetails} />}
        {view === 'product' && <ProductDetails product={selectedProduct} setView={setView} addToCart={addToCart} />}
        {view === 'cart' && <Cart cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} setView={setView} />}
        {view === 'checkout' && <Checkout cart={cart} setView={setView} placeOrder={placeOrder} loggedInUser={loggedInUser} showPopup={showPopup} />}
        {view === 'services' && <Services />}
        
        {view === 'admin' && !loggedInUser && <AuthPage users={users} setUsers={setUsers} onLogin={setLoggedInUser} showPopup={showPopup} />}
        {view === 'admin' && loggedInUser?.role === 'admin' && <AdminPanel products={products} setProducts={setProducts} categories={categories} setCategories={setCategories} orders={orders} updateOrderStatus={updateOrderStatus} users={users} loggedInUser={loggedInUser} showPopup={showPopup} />}
        {view === 'admin' && loggedInUser?.role === 'customer' && <CustomerDashboard loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} orders={orders} users={users} setUsers={setUsers} showPopup={showPopup} />}
      </main>

      <Footer />
      <a href="https://wa.me/8801830976800" className="floating-chat" target="_blank" rel="noopener noreferrer" title="Chat on WhatsApp"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></a>

      {popupMsg && (
        <div className="custom-popup-overlay" onClick={() => setPopupMsg('')}>
          <div className="custom-popup-box" onClick={e => e.stopPropagation()}>
            <div className="custom-popup-header">System Notification</div>
            <div className="custom-popup-content">{popupMsg}</div>
            <div className="custom-popup-footer">
              <button className="custom-popup-btn" onClick={() => setPopupMsg('')}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}