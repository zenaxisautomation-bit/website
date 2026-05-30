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

// Make sure your image file is exactly named "ZenAxisLogo.png" inside the "src" folder!
import zaLogo from './ZenAxisLogo.png'; 

const defaultAdminUser = {
  id: 1, firstName: 'System', lastName: 'Admin', email: 'zenaxisautomation@gmail.com', phone: '01830976800', 
  address: 'ZenAxis HQ, Dhaka', password: 'admin123', role: 'admin'
};

const formatBDT = (amount) => "৳" + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const BD_DATA = {
  divisions: ["Dhaka", "Chattogram", "Barishal", "Khulna", "Rajshahi", "Rangpur", "Sylhet", "Mymensingh"],
  districts: {
    "Dhaka": ["Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail"],
    "Chattogram": ["Bandarban", "Brahmanbaria", "Chandpur", "Chattogram", "Cox's Bazar", "Feni", "Khagrachhari", "Lakshmipur", "Noakhali", "Rangamati"],
    "Barishal": ["Barguna", "Barishal", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur"],
    "Khulna": ["Bagerhat", "Chuadanga", "Jessore", "Jhenaidah", "Khulna", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira"],
    "Rajshahi": ["Bogra", "Joypurhat", "Naogaon", "Natore", "Chapai Nawabganj", "Pabna", "Rajshahi", "Sirajganj"],
    "Rangpur": ["Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon"],
    "Sylhet": ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"],
    "Mymensingh": ["Jamalpur", "Mymensingh", "Netrokona", "Sherpur"]
  }
};

const initialCategories = ["Components", "Peripherals", "Monitors", "Accessories"];

const initialProducts = [
  { 
    id: 1, name: "ZenAxis Quantum CPU", category: "Components", price: 55000, originalPrice: 65000, description: "Next-gen processing power.", isHotDeal: true, isFeatured: true, stock: 15,
    images: ["https://via.placeholder.com/800x800/0E5E60/ffffff?text=Quantum+CPU", "https://via.placeholder.com/800x800/168285/ffffff?text=CPU+Angle+2", "https://via.placeholder.com/800x800/073839/ffffff?text=CPU+Angle+3"],
    quickSpecs: "High-Precision ZenAxis Engineering\nAerospace-Grade Build Materials\nOptimized for Industrial Automation\n1-Year Comprehensive Warranty",
    longDescription: "Experience the pinnacle of industrial control with the ZenAxis Quantum CPU.\n\nManufactured in top-tier facilities, we ensure that every unit passes rigorous stress tests.",
    technicalSpecs: "Architecture: 5nm Quantum Node\nCores: 32-Core / 64-Thread\nBase Clock: 4.2 GHz",
    shippingInfo: "Ships within 24 hours from Dhaka Warehouse.\nStandard Delivery: 3-5 Business Days."
  },
  { 
    id: 2, name: "Neon Flux Keyboard", category: "Peripherals", price: 14500, originalPrice: 16500, description: "Mechanical keys with RGB sync.", isHotDeal: false, isFeatured: true, stock: 42,
    images: ["https://via.placeholder.com/800x800/0E5E60/ffffff?text=Neon+Keyboard", "https://via.placeholder.com/800x800/C89B3C/ffffff?text=Keyboard+Glow"],
    quickSpecs: "Tactile Mechanical Switches\nFull RGB Backlighting\nAircraft-Grade Aluminum Frame",
    longDescription: "The Neon Flux Keyboard is built for operators who need tactile feedback and extreme durability.",
    technicalSpecs: "Switch Type: ZenAxis Tactile Blue\nPolling Rate: 1000Hz\nWeight: 1.2kg",
    shippingInfo: "Ships within 48 hours.\nStandard Delivery: 3-5 Business Days."
  }
];


// 2. Navigation Bar
const Navbar = ({ view, navigateTo, cartCount, loggedInUser, setLoggedInUser, isDarkMode, setIsDarkMode, searchTerm, setSearchTerm }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (newView) => {
    navigateTo(newView);
    setIsMobileMenuOpen(false); 
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem('zen_user_v15');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="navbar" ref={navRef}>
      <div className="nav-main-row">
        <div className="nav-left-group">
          <div className="logo" onClick={() => handleNavClick('home')} style={{cursor: 'pointer'}}>
            <img src={zaLogo} alt="ZenAxis Automation" className="nav-logo-img" />
          </div>
          
          {/* Desktop Search */}
          <div className="nav-search-wrap desktop-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="nav-search-icon">
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search products..." 
              className="nav-search-input"
              value={searchTerm} 
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if(view !== 'home' && e.target.value) navigateTo('home');
              }} 
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.target.blur();
              }}
            />
          </div>
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
            <button onClick={handleLogout} style={{color: '#ff4757'}}>Logout</button>
          )}
          <button className="theme-toggle-icon" onClick={() => { setIsDarkMode(!isDarkMode); setIsMobileMenuOpen(false); }} title="Toggle Theme">
            {isDarkMode ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            )}
          </button>
        </nav>
      </div>

      {/* Mobile Search - Visible only on small screens */}
      <div className="nav-search-wrap mobile-search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="nav-search-icon">
          <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          placeholder="Search products..." 
          className="nav-search-input"
          value={searchTerm} 
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if(view !== 'home' && e.target.value) navigateTo('home');
          }} 
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.target.blur();
          }}
        />
      </div>
    </header>
  );
};



// 3. Hero & Product Cards
const HeroSlider = ({ products, addToCart, onViewDetails }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderProducts = products.filter(p => p.isFeatured).slice(0, 5); 
  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev) => (prev === sliderProducts.length - 1 ? 0 : prev + 1)), 4000);
    return () => clearInterval(timer);
  }, [sliderProducts.length]);
  if (sliderProducts.length === 0) return null;
  const product = sliderProducts[currentSlide];
  return (
    <div className="hero-slider" onClick={() => onViewDetails(product)} style={{cursor: 'pointer'}}>
      <div className="hero-content">
        <span className="featured-badge">Featured Product</span>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <div className="hero-price">{formatBDT(product.price)}</div>
        <button className="btn-gradient" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>Add to Cart</button>
      </div>
      <div className="hero-image"><img src={product.images?.[0]} alt={product.name} /></div>
    </div>
  );
};

const ProductCard = ({ product, addToCart, onViewDetails }) => (
  <div className="product-card" onClick={() => onViewDetails(product)}>
    {product.isHotDeal && <div className="hot-badge">🔥 HOT DEAL</div>}
    {(!product.stock || product.stock <= 0) && <div className="hot-badge" style={{background: '#555', right: 'auto', left: '15px'}}>SOLD OUT</div>}
    <img src={product.images?.[0]} alt={product.name} />
    <div className="card-info">
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '0.4rem'}}>
        <span className="category-tag">{product.category || 'General'}</span>
        <span className="stock-pill" style={{background: (product.stock || 0) < 5 ? 'rgba(255, 71, 87, 0.1)' : 'rgba(46, 204, 113, 0.1)', color: (product.stock || 0) < 5 ? '#ff4757' : '#2ecc71'}}>
          {(product.stock || 0) > 0 ? `IN STOCK: ${product.stock}` : 'OUT OF STOCK'}
        </span>
      </div>
      <h3>{product.name}</h3>
      <p className="description">{product.description}</p>
      <div className="price-row">
        <span className="price">{formatBDT(product.price)}</span>
        {product.originalPrice && <span className="old-price">{formatBDT(product.originalPrice)}</span>}
      </div>
      <button 
        className="btn-outline" 
        disabled={!product.stock || product.stock <= 0}
        onClick={(e) => { e.stopPropagation(); addToCart(product); }}
      >
        {(product.stock || 0) > 0 ? '+ Add to Cart' : 'Sold Out'}
      </button>
    </div>
  </div>
);

// 4. Product Details
const ProductDetails = ({ product, navigateTo, addToCart }) => {
  const [activeTab, setActiveTab] = useState('overview'); 
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  if (!product) return null;
  const renderQuickSpecs = () => {
    if (!product.quickSpecs) return <li>✓ Standard Industrial Build</li>;
    return product.quickSpecs.split('\n').map((spec, index) => spec.trim() ? <li key={index}>✓ {spec}</li> : null);
  };
  
  const isOutOfStock = !product.stock || product.stock <= 0;

  return (
    <div className="product-details-page fade-in">
      <button className="btn-back" onClick={() => navigateTo('home')}>← Back to Shop</button>
      <div className="details-layout-top">
        <div className="details-image-container">
          <img src={product.images?.[selectedImageIdx]} alt={product.name} className="details-main-img" />
          {product.isHotDeal && <div className="details-hot-badge">🔥 Limited Time Offer</div>}
          {isOutOfStock && <div className="details-hot-badge" style={{background: '#555', top: '50px'}}>⚠️ Temporarily Out of Stock</div>}
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
            <button 
              className="btn-gradient btn-large" 
              disabled={isOutOfStock}
              onClick={() => addToCart(product)}
            >
              {isOutOfStock ? 'Currently Unavailable' : 'Add to Cart'}
            </button>
            <p className="stock-status" style={{color: isOutOfStock ? '#ff4757' : (product.stock < 5 ? '#e67e22' : '#2ecc71')}}>
              {isOutOfStock ? '❌ Out of Stock' : (product.stock < 10 ? `⚠️ Low Stock: Only ${product.stock} units left!` : `✅ In Stock: ${product.stock} units available`)}
            </p>
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
const Home = ({ products, categories, addToCart, onViewDetails, searchTerm, setSearchTerm }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // 1. Get filtered list from ALL products
  const filteredProducts = products.filter(p => {
    const term = searchTerm.trim().toLowerCase();
    const matchesCategory = selectedCategory === 'All' || (p.category || 'General') === selectedCategory;
    const matchesSearch = !term || 
                          p.name.toLowerCase().includes(term) || 
                          p.description.toLowerCase().includes(term) ||
                          (p.category || '').toLowerCase().includes(term);
    
    return matchesCategory && matchesSearch;
  });

  // 2. Decide how to display them
  const isSearching = searchTerm.trim() !== '';
  
  // If searching, show everything in one list. 
  // If just browsing a category, keep the "Hot Deals" separate.
  const hotDeals = filteredProducts.filter(p => p.isHotDeal);
  const regularProducts = filteredProducts.filter(p => !p.isHotDeal);
  
  return (
    <div className="home-view fade-in">
      <div className="shop-layout">
        {!isSearching && (
          <aside className="sidebar">
            <h3 className="sidebar-title">MENU CATEGORIES</h3>
            <div className="category-list">
              <button className={selectedCategory === 'All' ? 'active-cat' : ''} onClick={() => setSelectedCategory('All')}>All</button>
              {categories.map(cat => <button key={cat} className={selectedCategory === cat ? 'active-cat' : ''} onClick={() => setSelectedCategory(cat)}>{cat}</button>)}
            </div>
          </aside>
        )}
        <div className="shop-content" style={isSearching ? {width: '100%'} : {}}>
          {!isSearching && <HeroSlider products={products} addToCart={addToCart} onViewDetails={onViewDetails} />}

          {/* UI Section: RESULTS */}
          {isSearching ? (
            <section className="section">
              <h2 className="section-title"><span>Search</span> Results ({filteredProducts.length})</h2>
              <div className="product-grid">
                {filteredProducts.length > 0 ? filteredProducts.map(p => (
                  <ProductCard key={p.id} product={p} addToCart={addToCart} onViewDetails={onViewDetails} />
                )) : (
                  <div className="empty-state glass-panel" style={{gridColumn: '1 / -1'}}>
                    <h3>No Matches Found</h3>
                    <p>We couldn't find any products matching "{searchTerm}".</p>
                    <button className="btn-text" onClick={() => setSearchTerm('')}>Clear Search</button>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <>
              {hotDeals.length > 0 && selectedCategory === 'All' && (
                <section className="section">
                  <h2 className="section-title"><span>🔥 Hot</span> Deals</h2>
                  <div className="product-grid">{hotDeals.map(p => <ProductCard key={p.id} product={p} addToCart={addToCart} onViewDetails={onViewDetails} />)}</div>
                </section>
              )}
              <section className="section">
                <h2 className="section-title"><span>{selectedCategory}</span> Products</h2>
                <div className="product-grid">
                  {regularProducts.length > 0 ? regularProducts.map(p => (
                    <ProductCard key={p.id} product={p} addToCart={addToCart} onViewDetails={onViewDetails} />
                  )) : (
                    <div className="empty-state glass-panel" style={{gridColumn: '1 / -1'}}>
                      <p>No products found in this category.</p>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
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
const Cart = ({ cart, removeFromCart, updateQuantity, navigateTo }) => {
  const total = cart.reduce((sum, item) => sum + ((item?.price || 0) * (item?.quantity || 1)), 0);
  if (!cart || cart.length === 0) return (
    <div className="empty-state fade-in glass-panel">
      <h2>Your Cart is Empty</h2>
      <button className="btn-gradient" onClick={() => navigateTo('home')} style={{marginTop: '1rem'}}>Go to Shop</button>
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
        <button className="btn-gradient checkout-btn" onClick={() => navigateTo('checkout')}>Proceed to Secure Checkout</button>
      </div>
    </div>
  );
};

// 7. Checkout System
const Checkout = ({ cart, navigateTo, placeOrder, loggedInUser, showPopup }) => {
  const [formData, setFormData] = useState({
    name: loggedInUser ? `${loggedInUser.firstName} ${loggedInUser.lastName}` : '', 
    phone: loggedInUser ? loggedInUser.phone : '', 
    address: loggedInUser ? loggedInUser.address : '', 
    division: loggedInUser ? (loggedInUser.division || '') : '',
    district: loggedInUser ? (loggedInUser.district || '') : '',
    paymentMethod: 'bKash', 
    selectedBank: 'Islami Bank',
    trxId: ''
  });
  const total = cart.reduce((sum, item) => sum + ((item?.price || 0) * (item?.quantity || 1)), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(formData.paymentMethod !== 'COD' && !formData.trxId) {
      return showPopup("Please provide the Transaction ID for verification.");
    }
    placeOrder(formData, total);
  };

  const allDistricts = Object.values(BD_DATA.districts).flat().sort();

  return (
    <div className="checkout-container fade-in glass-panel">
      <button className="btn-back" onClick={() => navigateTo('cart')}>← Back to Cart</button>
      <h2 className="admin-section-title">Secure Checkout</h2>
      <div className="checkout-layout">
        <form onSubmit={handleSubmit} className="checkout-form">
          <h3>Delivery Information</h3>
          <div className="form-col">
            <label>Full Name</label><input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <label>Phone Number</label>
            <input 
              type="tel" 
              required 
              placeholder="e.g. 01830976800"
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} 
            />
            
            <label>Complete Street Address (Area, House, Road)</label>
            <textarea required rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            
            <label>Division</label>
            <input type="text" list="divisions" required placeholder="Type Division..." value={formData.division} onChange={e => setFormData({...formData, division: e.target.value, district: ''})} />
            <datalist id="divisions">
              {BD_DATA.divisions.map(div => <option key={div} value={div} />)}
            </datalist>

            <label>District</label>
            <input type="text" list="districts" required placeholder="Type District..." value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} />
            <datalist id="districts">
              {(BD_DATA.districts[formData.division] || allDistricts).map(dist => <option key={dist} value={dist} />)}
            </datalist>
          </div>
          <h3 style={{marginTop: '2rem'}}>Payment Method</h3>
          <div className="payment-options">
            <label className={`pay-card ${formData.paymentMethod === 'bKash' ? 'selected' : ''}`}><input type="radio" name="payment" value="bKash" checked={formData.paymentMethod === 'bKash'} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} />bKash</label>
            <label className={`pay-card ${formData.paymentMethod === 'Nagad' ? 'selected' : ''}`}><input type="radio" name="payment" value="Nagad" checked={formData.paymentMethod === 'Nagad'} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} />Nagad</label>
            <label className={`pay-card ${formData.paymentMethod === 'Bank' ? 'selected' : ''}`}><input type="radio" name="payment" value="Bank" checked={formData.paymentMethod === 'Bank'} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} />Bank Transfer</label>
            <label className={`pay-card ${formData.paymentMethod === 'COD' ? 'selected' : ''}`}><input type="radio" name="payment" value="COD" checked={formData.paymentMethod === 'COD'} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} />Cash on Delivery</label>
          </div>
          <div className="payment-instructions form-col">
            {formData.paymentMethod === 'bKash' && <p>Send money to bKash Merchant: <strong>01830976800</strong></p>}
            {formData.paymentMethod === 'Nagad' && <p>Send money to Nagad Merchant: <strong>01830976800</strong></p>}
            {formData.paymentMethod === 'Bank' && (
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <p style={{fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--gold-main)', fontWeight: '600'}}>Select your preferred bank account:</p>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  <label style={{
                    cursor: 'pointer', padding: '10px', borderRadius: '8px', border: `1px solid ${formData.selectedBank === 'Islami Bank' ? 'var(--gold-main)' : 'var(--glass-border)'}`,
                    background: formData.selectedBank === 'Islami Bank' ? 'rgba(200, 155, 60, 0.1)' : 'rgba(0,0,0,0.03)',
                    transition: '0.3s'
                  }}>
                    <input type="radio" name="bankSelect" value="Islami Bank" checked={formData.selectedBank === 'Islami Bank'} onChange={e => setFormData({...formData, selectedBank: e.target.value})} style={{marginRight: '8px'}} />
                    <div style={{fontSize: '0.8rem', lineHeight: '1.4', marginTop: '5px'}}>
                      <p style={{margin: '0 0 5px 0'}}><strong>ISLAMI BANK</strong></p>
                      <p style={{margin: '2px 0'}}>AC: 20501330204977205</p>
                      <p style={{margin: '2px 0'}}>Routing: 125500948</p>
                    </div>
                  </label>
                  <label style={{
                    cursor: 'pointer', padding: '10px', borderRadius: '8px', border: `1px solid ${formData.selectedBank === 'DBBL' ? 'var(--gold-main)' : 'var(--glass-border)'}`,
                    background: formData.selectedBank === 'DBBL' ? 'rgba(200, 155, 60, 0.1)' : 'rgba(0,0,0,0.03)',
                    transition: '0.3s'
                  }}>
                    <input type="radio" name="bankSelect" value="DBBL" checked={formData.selectedBank === 'DBBL'} onChange={e => setFormData({...formData, selectedBank: e.target.value})} style={{marginRight: '8px'}} />
                    <div style={{fontSize: '0.8rem', lineHeight: '1.4', marginTop: '5px'}}>
                      <p style={{margin: '0 0 5px 0'}}><strong>DBBL</strong></p>
                      <p style={{margin: '2px 0'}}>AC: 1681580454661</p>
                      <p style={{margin: '2px 0'}}>Routing: 090500949</p>
                    </div>
                  </label>
                </div>
                {formData.selectedBank === 'Islami Bank' && (
                  <div className="fade-in" style={{fontSize: '0.85rem', padding: '10px', background: 'rgba(46, 204, 113, 0.05)', borderRadius: '8px', border: '1px solid rgba(46, 204, 113, 0.2)'}}>
                    <p><strong>Transfer to:</strong> Islami Bank Bangladesh</p>
                    <p><strong>Name:</strong> Mahmud Arif</p>
                    <p><strong>Branch:</strong> Kushtia</p>
                  </div>
                )}
                {formData.selectedBank === 'DBBL' && (
                  <div className="fade-in" style={{fontSize: '0.85rem', padding: '10px', background: 'rgba(46, 204, 113, 0.05)', borderRadius: '8px', border: '1px solid rgba(46, 204, 113, 0.2)'}}>
                    <p><strong>Transfer to:</strong> Dutch Bangla Bank</p>
                    <p><strong>Name:</strong> Mahmud Arif</p>
                    <p><strong>Branch:</strong> Kushtia</p>
                  </div>
                )}
              </div>
            )}
            {formData.paymentMethod === 'COD' && <p>Pay with cash upon delivery to your address.</p>}

            {formData.paymentMethod !== 'COD' && (
              <>
                <label>Transaction ID / Reference Number</label>
                <input type="text" required value={formData.trxId} onChange={e => setFormData({...formData, trxId: e.target.value})} />
              </>
            )}
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
  const [regData, setRegData] = useState({ firstName: '', lastName: '', address: '', phone: '', email: '', password: '', confirmPassword: '', division: '', district: '' });

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
    const newUser = { 
      firstName: regData.firstName, 
      lastName: regData.lastName, 
      address: regData.address, 
      division: regData.division,
      district: regData.district,
      phone: regData.phone, 
      email: regData.email, 
      password: regData.password, 
      role: 'customer' 
    };
    
    try {
      await addDoc(collection(db, "users"), newUser);
      showPopup('Account created successfully! You can now log in.');
      setIsLoginView(true); setLoginEmail(regData.email);
    } catch (err) {
      showPopup("Registration Error: " + err.message);
    }
  };

  const allDistricts = Object.values(BD_DATA.districts).flat().sort();

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
          
          <label>Street Address</label>
          <textarea rows="2" placeholder="Area, House, Road" value={regData.address} onChange={e => setRegData({...regData, address: e.target.value})} required />
          
          <label>Division</label>
          <input type="text" list="reg-divisions" placeholder="Division" value={regData.division} onChange={e => setRegData({...regData, division: e.target.value, district: ''})} required />
          <datalist id="reg-divisions">
            {BD_DATA.divisions.map(div => <option key={div} value={div} />)}
          </datalist>

          <label>District</label>
          <input type="text" list="reg-districts" placeholder="District" value={regData.district} onChange={e => setRegData({...regData, district: e.target.value})} required />
          <datalist id="reg-districts">
            {(BD_DATA.districts[regData.division] || allDistricts).map(dist => <option key={dist} value={dist} />)}
          </datalist>
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
                    <td data-label="Order ID / Date"><strong>#{order.id}</strong><br/><span style={{fontSize:'0.8rem', color:'#888'}}>{order.date}</span></td>
                    <td data-label="Items">{order.items.map(i => <div key={i.id} style={{fontSize:'0.85rem'}}>• {i.quantity}x {i.name}</div>)}</td>
                    <td data-label="Total / Payment">
                      <strong>{formatBDT(order.total)}</strong><br/>
                      <span className="category-tag">{order.customer.paymentMethod}</span><br/>
                      <span style={{fontSize:'0.75rem', color:'#888'}}>{order.customer.district}, {order.customer.division}</span>
                    </td>
                    <td data-label="Status">
                      <span className="category-tag" style={{
                        background: order.status === 'Completed' ? 'rgba(46, 204, 113, 0.15)' : (order.status === 'Shipped' ? 'rgba(52, 152, 219, 0.15)' : 'rgba(241, 196, 15, 0.15)'),
                        color: order.status === 'Completed' ? '#2ecc71' : (order.status === 'Shipped' ? '#3498db' : '#f1c40f'),
                        borderColor: 'transparent',
                        fontWeight: '700'
                      }}>
                        {order.status === 'Completed' ? '🟢 ' : (order.status === 'Shipped' ? '🔵 ' : '🟡 ')}
                        {order.status}
                      </span>
                    </td>
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
              
              <label>District</label>
              <input type="text" list="profile-districts" placeholder="District" value={editData.district || ''} onChange={e => setEditData({...editData, district: e.target.value})} required />
              <datalist id="profile-districts">
                {(BD_DATA.districts[editData.division] || Object.values(BD_DATA.districts).flat().sort()).map(dist => <option key={dist} value={dist} />)}
              </datalist>

              <label>Division</label>
              <input type="text" list="profile-divisions" placeholder="Division" value={editData.division || ''} onChange={e => setEditData({...editData, division: e.target.value, district: ''})} required />
              <datalist id="profile-divisions">
                {BD_DATA.divisions.map(div => <option key={div} value={div} />)}
              </datalist>

              <label>Street Address</label><textarea rows="3" value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} required />
              <label>Change Password</label><input type="text" value={editData.password} onChange={e => setEditData({...editData, password: e.target.value})} required />
              <button type="submit" className="btn-gradient">Save Changes</button>
           </form>
         </div>
      )}
    </div>
  );
};

// 9B. MASTER ADMIN PANEL
const AdminPanel = ({ products, setProducts, loggedInUser, categories, setCategories, orders, updateOrderStatus, deleteOrder, users, showPopup }) => {
  const [activeTab, setActiveTab] = useState('orders'); 
  const [editingProduct, setEditingProduct] = useState(null);
  const [newCatName, setNewCatName] = useState("");

  const handleAddNew = () => {
    const defaultCat = categories.length > 0 ? categories[0] : "General";
    setEditingProduct({ id: Date.now(), name: '', category: defaultCat, price: '', originalPrice: '', stock: 0, description: '', longDescription: '', quickSpecs: '', technicalSpecs: '', shippingInfo: '', isHotDeal: false, isFeatured: false, images: [] });
  };
  const handleSave = async () => {
    if (!editingProduct.name || !editingProduct.price) return showPopup("Name and Price are required!");
    if (!editingProduct.images || editingProduct.images.length === 0) return showPopup("Please upload at least 1 image!");
    
    try {
      const { id, ...pData } = editingProduct;
      const productToSave = { 
        ...pData, 
        price: Number(pData.price), 
        originalPrice: pData.originalPrice ? Number(pData.originalPrice) : null,
        stock: Number(pData.stock) || 0
      };
      
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
          {/* Section 1: Media Card */}
          <div className="form-card">
            <h3 className="form-card-title">Product Media</h3>
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
          </div>

          <div className="editor-form-content">
            {/* Section 2: Basic Info Card */}
            <div className="form-card">
              <h3 className="form-card-title">General Information</h3>
              <div className="form-col">
                <label>Product Name</label>
                <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} placeholder="e.g. ZenAxis Servo Motor" />
                <label>Category</label>
                <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="category-dropdown">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            {/* Section 3: Pricing & Inventory Card */}
            <div className="form-card">
              <h3 className="form-card-title">Pricing & Inventory</h3>
              <div className="row">
                <div className="col"><label>Sale Price (৳)</label><input type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} /></div>
                <div className="col"><label>Regular Price (৳)</label><input type="number" value={editingProduct.originalPrice || ''} onChange={e => setEditingProduct({...editingProduct, originalPrice: e.target.value})} /></div>
              </div>
              <div className="form-col">
                <label>Stock Available (Units)</label>
                <input type="number" value={editingProduct.stock || 0} onChange={e => setEditingProduct({...editingProduct, stock: e.target.value})} />
              </div>
            </div>

            {/* Section 4: Descriptions Card */}
            <div className="form-card">
              <h3 className="form-card-title">Descriptions</h3>
              <label>Brief Description (Card View)</label>
              <input type="text" value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
              <label>Detailed Overview (Tab View)</label>
              <textarea rows="4" value={editingProduct.longDescription || ''} onChange={e => setEditingProduct({...editingProduct, longDescription: e.target.value})} />
            </div>

            {/* Section 5: Technical Details Card */}
            <div className="form-card">
              <h3 className="form-card-title">Technical Specifications</h3>
              <label>Quick Bullet Points (Line by line)</label>
              <textarea rows="4" value={editingProduct.quickSpecs || ''} onChange={e => setEditingProduct({...editingProduct, quickSpecs: e.target.value})} placeholder="Enter features line by line..." />
              <label>Full Tech Specs Table</label>
              <textarea rows="4" value={editingProduct.technicalSpecs || ''} onChange={e => setEditingProduct({...editingProduct, technicalSpecs: e.target.value})} />
            </div>

            {/* Section 6: Options & Settings Card */}
            <div className="form-card">
              <h3 className="form-card-title">Display Settings</h3>
              <div style={{display:'flex', flexDirection:'column', gap: '1rem', marginTop: '1rem'}}>
                <label className="checkbox-label"><input type="checkbox" checked={editingProduct.isHotDeal} onChange={e => setEditingProduct({...editingProduct, isHotDeal: e.target.checked})} /> High-Demand "Hot Deal" 🔥</label>
                <label className="checkbox-label"><input type="checkbox" checked={editingProduct.isFeatured} onChange={e => setEditingProduct({...editingProduct, isFeatured: e.target.checked})} /> Hero Slider "Featured" 🌟</label>
              </div>
            </div>

            <div className="action-buttons" style={{marginTop: '2rem'}}>
              <button className="btn-gradient" onClick={handleSave} style={{flex: 2}}>Update Cloud System</button>
              <button className="btn-outline" onClick={() => setEditingProduct(null)} style={{flex: 1}}>Discard Changes</button>
            </div>
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
          <button className={activeTab === 'slider' ? 'tab-active' : ''} onClick={() => setActiveTab('slider')}>Hero Slider</button>
          <button className={activeTab === 'categories' ? 'tab-active' : ''} onClick={() => setActiveTab('categories')}>Categories</button>
          <button className={activeTab === 'users' ? 'tab-active' : ''} onClick={() => setActiveTab('users')}>Users</button>
        </div>
      </div>

      {activeTab === 'slider' && (
        <div className="glass-panel fade-in" style={{padding: '1.5rem'}}>
          <h3 className="admin-section-title">Manage Hero Slider</h3>
          <p className="sub-text">Select products to feature in the landing page slider (Recommended: 3-5 items).</p>
          <div className="slider-management-list">
            {products.map(p => (
              <div key={p.id} className="slider-admin-card">
                <img src={p.images?.[0]} alt={p.name} />
                <div className="slider-info">
                  <h4>{p.name}</h4>
                  <p>{p.category} | {formatBDT(p.price)}</p>
                </div>
                <div className="slider-action">
                  <label className="checkbox-label" style={{marginBottom: 0}}>
                    <input 
                      type="checkbox" 
                      checked={p.isFeatured} 
                      onChange={async (e) => {
                        try {
                          await updateDoc(doc(db, "products", p.id), { isFeatured: e.target.checked });
                          showPopup(`${p.name} ${e.target.checked ? 'added to' : 'removed from'} slider.`);
                        } catch (err) {
                          showPopup("Slider Update Error: " + err.message);
                        }
                      }} 
                    /> 
                    {p.isFeatured ? '🌟 Featured' : 'Show in Slider'}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="glass-panel table-responsive fade-in">
          <h3 className="admin-section-title" style={{padding: '0 1rem'}}>All Customer Orders</h3>
          {orders.length === 0 ? <p style={{padding: '2rem', textAlign: 'center', color: '#666'}}>No orders have been placed yet.</p> : (
            <table className="admin-table">
              <thead><tr><th>Order ID / Date</th><th>Customer Info</th><th>Items</th><th>Total / Payment</th><th>Status</th></tr></thead>
              <tbody>
                {[...orders].reverse().map(order => (
                  <tr key={order.id}>
                    <td data-label="Order ID / Date"><strong>#{order.id}</strong><br/><span style={{fontSize:'0.8rem', color:'#888'}}>{order.date}</span></td>
                    <td data-label="Customer Info">
                      <strong>{order.customer.name}</strong><br/>
                      {order.customer.phone}<br/>
                      <span style={{fontSize:'0.8rem'}}>
                        {order.customer.address}<br/>
                        {order.customer.district}, {order.customer.division}
                      </span>
                    </td>
                    <td data-label="Items">{order.items.map(i => <div key={i.id} style={{fontSize:'0.85rem'}}>• {i.quantity}x {i.name}</div>)}</td>
                    <td data-label="Total / Payment"><strong>{formatBDT(order.total)}</strong><br/><span className="category-tag">{order.customer.paymentMethod}</span><br/><span style={{fontSize:'0.8rem'}}>Trx: {order.customer.trxId}</span></td>
                    <td data-label="Status">
                      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                        <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} className="category-dropdown" style={{padding: '5px', marginBottom: 0, width: 'auto'}}>
                          <option value="Pending">🟡 Pending</option>
                          <option value="Shipped">🔵 Shipped</option>
                          <option value="Completed">🟢 Completed</option>
                        </select>
                        <button className="btn-text delete" onClick={() => deleteOrder(order.id)} title="Delete Order" style={{padding: '5px', fontSize: '1.2rem', color: '#ff4757'}}>✕</button>
                      </div>
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
            <thead><tr><th>Image</th><th>Name / Category</th><th>Pricing</th><th>Stock</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td data-label="Image"><img src={p.images?.[0]} alt={p.name} className="table-img" /></td>
                  <td data-label="Name / Category"><strong>{p.name}</strong><br/><span className="category-tag" style={{marginTop: '5px'}}>{p.category || 'General'}</span></td>
                  <td data-label="Pricing"><strong>{formatBDT(p.price)}</strong>{p.originalPrice && <div style={{fontSize:'0.8rem', textDecoration:'line-through', opacity:0.5}}>{formatBDT(p.originalPrice)}</div>}</td>
                  <td data-label="Stock"><span style={{fontWeight:'700', color: (p.stock || 0) < 5 ? '#ff4757' : 'inherit'}}>{p.stock || 0} Units</span></td>
                  <td data-label="Actions"><button className="btn-text edit" onClick={() => setEditingProduct(p)}>Edit</button><button className="btn-text delete" onClick={() => handleDelete(p.id)}>Delete</button></td>
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
                  <td data-label="Category Name"><strong>{c}</strong></td>
                  <td data-label="Status"><span className="category-tag" style={{ background: 'rgba(14, 94, 96, 0.1)', color: 'var(--teal-main)' }}>Active</span></td>
                  <td data-label="Actions" style={{ textAlign: 'right' }}>
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
                  <td data-label="ID"><span style={{fontSize:'0.8rem', color:'#888'}}>#{u.id}</span></td>
                  <td data-label="Name"><strong>{u.firstName} {u.lastName}</strong></td>
                  <td data-label="Email">{u.email}</td>
                  <td data-label="Phone & Address">{u.phone}<br/><span style={{fontSize:'0.8rem'}}>{u.address}</span></td>
                  <td data-label="Role"><span className="category-tag" style={u.role==='admin'?{background:'var(--teal-main)',color:'white',borderColor:'transparent'}:{}}>{u.role}</span></td>
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
          <a href="https://www.linkedin.com/company/zenaxisautomation/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
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
  const [searchTerm, setSearchTerm] = useState(''); // v3.6 Global Search
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [loggedInUser, setLoggedInUser] = useState(() => JSON.parse(localStorage.getItem('zen_user_v15')) || null);
  const [popupMsg, setPopupMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const showPopup = (msg) => setPopupMsg(msg);

  // --- BROWSER HISTORY SYNC (FIX MOBILE BACK BUTTON) ---
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.view) {
        setView(event.state.view);
        if (event.state.product) setSelectedProduct(event.state.product);
      } else {
        setView('home'); 
      }
    };
    window.addEventListener('popstate', handlePopState);
    window.history.replaceState({ view: 'home' }, '');
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (newView, product = null) => {
    if (newView === view && (!product || product?.id === selectedProduct?.id)) return;
    setView(newView);
    if (product) setSelectedProduct(product);
    window.history.pushState({ view: newView, product }, '', `#${newView}`);
  };

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
    if (!loading) {
      // Force update default admin to ensure the new email is active in Firestore
      setDoc(doc(db, "users", "admin-default"), defaultAdminUser);
    }
    if (!loading && categories.length === 0) {
      initialCategories.forEach(async (cat) => {
        await addDoc(collection(db, "categories"), { name: cat });
      });
    }
    if (!loading && products.length === 0) {
      initialProducts.forEach(async (p) => {
        const { id, ...pWithoutId } = p;
        await addDoc(collection(db, "products"), pWithoutId);
      });
    }
  }, [loading]);

  useEffect(() => localStorage.setItem('zen_cart_v15', JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem('zen_user_v15', JSON.stringify(loggedInUser)), [loggedInUser]);
  
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
  const handleViewDetails = (product) => { navigateTo('product', product); window.scrollTo(0, 0); };

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
      navigateTo('home');
    } catch (e) {
      showPopup("Order Error: " + e.message);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      showPopup(`Order #${orderId.substring(0, 6).toUpperCase()} status updated to ${newStatus}`);
    } catch (e) {
      showPopup("Status Update Error: " + e.message);
    }
  };

  const deleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to PERMANENTLY DELETE this order? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "orders", orderId));
        showPopup(`Order #${orderId.substring(0, 6).toUpperCase()} deleted.`);
      } catch (err) {
        showPopup("Delete Error: " + err.message);
      }
    }
  };

  if (loading) return <div className="empty-state"><h3>Initializing Industrial Backend...</h3></div>;

  return (
    <div className="App">
      <Navbar view={view} navigateTo={navigateTo} cartCount={cart.reduce((a, b) => a + (b.quantity || 1), 0)} loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <main className="container main-content">
        {view === 'home' && <Home products={products} categories={categories} addToCart={addToCart} onViewDetails={handleViewDetails} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
        {view === 'product' && <ProductDetails product={selectedProduct} navigateTo={navigateTo} addToCart={addToCart} />}
        {view === 'cart' && <Cart cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} navigateTo={navigateTo} />}
        {view === 'checkout' && <Checkout cart={cart} navigateTo={navigateTo} placeOrder={placeOrder} loggedInUser={loggedInUser} showPopup={showPopup} />}
        {view === 'services' && <Services />}
        
        {view === 'admin' && !loggedInUser && <AuthPage users={users} setUsers={setUsers} onLogin={setLoggedInUser} showPopup={showPopup} />}
        {view === 'admin' && loggedInUser?.role === 'admin' && <AdminPanel products={products} setProducts={setProducts} categories={categories} setCategories={setCategories} orders={orders} updateOrderStatus={updateOrderStatus} deleteOrder={deleteOrder} users={users} loggedInUser={loggedInUser} showPopup={showPopup} />}
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
