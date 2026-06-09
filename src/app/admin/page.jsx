"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, RefreshCw, FolderPlus, Smartphone, FileText, ClipboardList, 
  Trash2, Edit, PlusCircle, Check, X, Box, UserCheck, Calendar 
} from 'lucide-react';

const OFFLINE_BRANDS = [
  { id: 1, name: "Apple", description: "Apple iPhone Series" },
  { id: 2, name: "Samsung", description: "Samsung Mobile Phones" },
  { id: 3, name: "Xiaomi", description: "Xiaomi Smartphones" }
];

const OFFLINE_PRODUCTS = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    description: "Latest Apple flagship phone with titanium design.",
    price: "999.99",
    stock_quantity: 20,
    preorder_available: 0,
    preorder_release_date: null,
    image_url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=150",
    is_active: 1,
    brand_id: 1,
    brand_name: "Apple"
  },
  {
    id: 3,
    name: "iPhone 17 Pro Max",
    description: "Experience the next frontier of mobile intelligence.",
    price: "1399.99",
    stock_quantity: 0,
    preorder_available: 1,
    preorder_release_date: "2026-09-30T17:00:00.000Z",
    image_url: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=150",
    is_active: 1,
    brand_id: 1,
    brand_name: "Apple"
  }
];

const OFFLINE_ORDERS = [
  {
    id: 1045,
    user_id: 15,
    order_type: 'ORDER',
    status: 'PENDING',
    total_amount: '999.99',
    ordered_at: new Date(Date.now() - 3600000).toISOString(),
    full_name: 'Vann Sengmey',
    email: 'sovannarith748+14@gmail.com'
  }
];

const OFFLINE_INVENTORY = [
  {
    id: 1,
    product_id: 1,
    action_type: 'ADD',
    quantity_changed: 10,
    previous_stock: 10,
    new_stock: 20,
    performed_by: 16,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    product_name: "iPhone 15 Pro",
    performed_by_name: "Rith"
  }
];

export default function AdminDashboardPage() {
  const { admin, apiCall, addNotification } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'brands', 'products', 'orders', 'inventory'

  // Catalog loaded state
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Forms / Modal controllers
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [editBrand, setEditBrand] = useState(null); // null for create, object for edit
  const [brandName, setBrandName] = useState('');
  const [brandDesc, setBrandDesc] = useState('');

  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [pName, setPName] = useState('');
  const [pBrandId, setPBrandId] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pStock, setPStock] = useState('0');
  const [pPreorder, setPPreorder] = useState(false);
  const [pPreorderDate, setPPreorderDate] = useState('');
  const [pImageFile, setPImageFile] = useState(null);
  const [pImageUrl, setPImageUrl] = useState('');

  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProductId, setStockProductId] = useState('');
  const [stockAction, setStockAction] = useState('ADD'); // 'ADD', 'REMOVE'
  const [stockQty, setStockQty] = useState('');

  // Initial Load
  const fetchAllData = async () => {
    setLoading(true);
    // Load brands
    const bRes = await apiCall('/api/user/brands/all');
    if (bRes && bRes.success) setBrands(bRes.data);
    else setBrands(OFFLINE_BRANDS);

    // Load products
    const pRes = await apiCall('/api/user/products/all');
    if (pRes && pRes.success) setProducts(pRes.data);
    else setProducts(OFFLINE_PRODUCTS);

    // Load orders
    const oRes = await apiCall('/api/user/orders/all');
    if (oRes && oRes.success) setOrders(oRes.data);
    else setOrders(OFFLINE_ORDERS);

    // Load inventory logs
    const iRes = await apiCall('/api/user/inventory/all');
    if (iRes && iRes.success) setInventoryLogs(iRes.data);
    else setInventoryLogs(OFFLINE_INVENTORY);
    
    setLoading(false);
  };

  useEffect(() => {
    if (admin) {
      fetchAllData();
    }
  }, [admin]);

  // Brand Submit (Create / Edit)
  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    let res;
    if (editBrand) {
      // Edit Brand
      res = await apiCall(`/api/user/brands/${editBrand.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: brandName, description: brandDesc })
      });
    } else {
      // Create Brand
      res = await apiCall('/api/user/brands/create', {
        method: 'POST',
        body: JSON.stringify({ name: brandName, description: brandDesc })
      });
    }
    if (res && res.success) {
      addNotification(editBrand ? "Brand updated successfully" : "Brand created successfully", "success");
      setShowBrandModal(false);
      fetchAllData();
    } else {
      // Offline edit simulation
      addNotification("Offline: Operation completed locally", "info");
      if (editBrand) {
        setBrands(prev => prev.map(b => b.id === editBrand.id ? { ...b, name: brandName, description: brandDesc } : b));
      } else {
        setBrands(prev => [...prev, { id: Date.now(), name: brandName, description: brandDesc }]);
      }
      setShowBrandModal(false);
    }
  };

  const handleBrandDelete = async (brandId) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;
    const res = await apiCall(`/api/user/brands/${brandId}`, { method: 'DELETE' });
    if (res && res.success) {
      addNotification("Brand deleted successfully", "success");
      fetchAllData();
    } else {
      addNotification("Offline: Brand deleted locally", "info");
      setBrands(prev => prev.filter(b => b.id !== brandId));
    }
  };

  // Product Submit (Create / Edit)
  const handleProductSubmit = async (e) => {
    e.preventDefault();

    // Use FormData for file upload compatibility
    const fd = new FormData();
    fd.append('name', pName);
    fd.append('brand_id', pBrandId);
    fd.append('description', pDesc);
    fd.append('price', pPrice);
    fd.append('stock_quantity', pStock);
    fd.append('preorder_available', pPreorder ? '1' : '0');
    if (pPreorder && pPreorderDate) {
      fd.append('preorder_release_date', pPreorderDate);
    }
    if (pImageFile) {
      fd.append('image', pImageFile);
    } else if (pImageUrl) {
      fd.append('image_url', pImageUrl);
    }

    let res;
    if (editProduct) {
      // Edit Product
      // Note: For multipart FormData, omit 'Content-Type' header and fetch handles boundary
      res = await apiCall(`/api/user/products/${editProduct.id}`, {
        method: 'PUT',
        body: fd
      });
    } else {
      // Create Product
      res = await apiCall('/api/user/products/create', {
        method: 'POST',
        body: fd
      });
    }

    if (res && res.success) {
      addNotification(editProduct ? "Product updated successfully" : "Product created successfully", "success");
      setShowProductModal(false);
      fetchAllData();
    } else {
      addNotification("Offline: Product saved locally", "info");
      const matchedBrandName = brands.find(b => parseInt(b.id) === parseInt(pBrandId))?.name || 'Unknown';
      if (editProduct) {
        setProducts(prev => prev.map(p => p.id === editProduct.id ? {
          ...p,
          name: pName,
          brand_id: pBrandId,
          brand_name: matchedBrandName,
          description: pDesc,
          price: pPrice,
          stock_quantity: pStock,
          preorder_available: pPreorder ? 1 : 0,
          preorder_release_date: pPreorderDate || null,
          image_url: pImageUrl
        } : p));
      } else {
        setProducts(prev => [...prev, {
          id: Date.now(),
          name: pName,
          brand_id: pBrandId,
          brand_name: matchedBrandName,
          description: pDesc,
          price: pPrice,
          stock_quantity: pStock,
          preorder_available: pPreorder ? 1 : 0,
          preorder_release_date: pPreorderDate || null,
          image_url: pImageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=150',
          is_active: 1
        }]);
      }
      setShowProductModal(false);
    }
  };

  const handleProductDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const res = await apiCall(`/api/user/products/${productId}`, { method: 'DELETE' });
    if (res && res.success) {
      addNotification("Product deleted successfully", "success");
      fetchAllData();
    } else {
      addNotification("Offline: Product deleted locally", "info");
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  // Order Status Update
  const handleStatusChange = async (orderId, newStatus) => {
    const res = await apiCall(`/api/user/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    });
    if (res && res.success) {
      addNotification(`Order #${orderId} updated to ${newStatus}`, "success");
      fetchAllData();
    } else {
      addNotification("Offline: Status changed locally", "info");
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  const handleOrderDelete = async (orderId) => {
    if (!confirm("Are you sure you want to delete order record?")) return;
    const res = await apiCall(`/api/user/orders/${orderId}`, { method: 'DELETE' });
    if (res && res.success) {
      addNotification("Order record deleted", "success");
      fetchAllData();
    } else {
      addNotification("Offline: Deleted order locally", "info");
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  // Inventory Log Movement Submission
  const handleStockSubmit = async (e) => {
    e.preventDefault();
    if (!stockProductId || !stockQty) return;

    const res = await apiCall('/api/user/inventory/create', {
      method: 'POST',
      body: JSON.stringify({
        product_id: parseInt(stockProductId, 10),
        action_type: stockAction,
        quantity_changed: parseInt(stockQty, 10)
      })
    });
    if (res && res.success) {
      addNotification("Stock level updated and logged.", "success");
      setShowStockModal(false);
      fetchAllData();
    } else {
      addNotification("Offline: Stock logged locally", "info");
      const matchedProdName = products.find(p => parseInt(p.id) === parseInt(stockProductId))?.name || 'Unknown';
      const parsedQty = parseInt(stockQty, 10);
      
      // Update local product stock
      setProducts(prev => prev.map(p => {
        if (p.id === parseInt(stockProductId)) {
          const prevStock = parseInt(p.stock_quantity) || 0;
          const newStock = stockAction === 'ADD' ? prevStock + parsedQty : Math.max(0, prevStock - parsedQty);
          return { ...p, stock_quantity: newStock };
        }
        return p;
      }));

      // Create new inventory log row
      setInventoryLogs(prev => [
        {
          id: Date.now(),
          product_id: parseInt(stockProductId),
          product_name: matchedProdName,
          action_type: stockAction,
          quantity_changed: parsedQty,
          previous_stock: 20, // dummy
          new_stock: 30, // dummy
          performed_by_name: admin.full_name || 'Admin Coordinator',
          created_at: new Date().toISOString()
        },
        ...prev
      ]);
      setShowStockModal(false);
    }
  };

  // Access check
  if (!admin) {
    return (
      <div className="container" style={styles.centerContainer}>
        <div className="glass-panel" style={styles.promptCard}>
          <ShieldCheck size={48} color="var(--danger)" style={{ marginBottom: '1.25rem' }} />
          <h2>Access Denied</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem 0' }}>
            Administrative clearance is required to view dashboard metrics.
          </p>
          <Link href="/admin/login" className="btn btn-primary" style={{ width: '100%' }}>
            Sign In as Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={styles.container}>
      {/* Side Tabs Bar */}
      <div style={styles.dashboardHeader}>
        <div>
          <h1 className="text-gradient-primary" style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={28} />
            <span>Storefront Control Room</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Welcome back, <strong>{admin.full_name}</strong>
          </p>
        </div>
        <button onClick={fetchAllData} className="btn btn-secondary btn-sm" title="Sync catalog">
          <RefreshCw size={14} className={loading ? 'spinner' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      <div style={styles.tabNavbar} className="glass-panel">
        <button onClick={() => setActiveTab('overview')} style={styles.tabBtn(activeTab === 'overview')}>
          Overview Dashboard
        </button>
        <button onClick={() => setActiveTab('brands')} style={styles.tabBtn(activeTab === 'brands')}>
          Brands CRUD ({brands.length})
        </button>
        <button onClick={() => setActiveTab('products')} style={styles.tabBtn(activeTab === 'products')}>
          Products CRUD ({products.length})
        </button>
        <button onClick={() => setActiveTab('orders')} style={styles.tabBtn(activeTab === 'orders')}>
          Orders Controller ({orders.length})
        </button>
        <button onClick={() => setActiveTab('inventory')} style={styles.tabBtn(activeTab === 'inventory')}>
          Inventory Logs ({inventoryLogs.length})
        </button>
      </div>

      {loading ? (
        <div style={styles.tabCenterLoader}>
          <div style={styles.spinner} />
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Updating control panel stats...</p>
        </div>
      ) : (
        <div style={styles.tabContent}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={styles.overviewSection}>
              <div style={styles.metricGrid}>
                <div className="glass-panel" style={styles.metricCard}>
                  <Box size={24} color="var(--primary)" />
                  <span style={styles.metricVal}>{products.length}</span>
                  <span style={styles.metricLabel}>Total Catalog Products</span>
                </div>
                <div className="glass-panel" style={styles.metricCard}>
                  <ClipboardList size={24} color="var(--secondary)" />
                  <span style={styles.metricVal}>{orders.length}</span>
                  <span style={styles.metricLabel}>Orders Submitted</span>
                </div>
                <div className="glass-panel" style={styles.metricCard}>
                  <FolderPlus size={24} color="var(--accent)" />
                  <span style={styles.metricVal}>{brands.length}</span>
                  <span style={styles.metricLabel}>Brands Managed</span>
                </div>
                <div className="glass-panel" style={styles.metricCard}>
                  <UserCheck size={24} color="var(--success)" />
                  <span style={styles.metricVal}>
                    {orders.filter(o => o.status === 'PAID' || o.status === 'DELIVERED').length}
                  </span>
                  <span style={styles.metricLabel}>Paid / Completed Orders</span>
                </div>
              </div>

              {/* Quick Details Logs */}
              <div style={styles.dashboardSplit}>
                <div className="glass-panel" style={{ ...styles.dashboardPanel, flex: 1.5 }}>
                  <h3 style={styles.panelTitle}>Recent Orders</h3>
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Customer</th>
                          <th>Order Type</th>
                          <th>Total Paid</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(o => (
                          <tr key={o.id}>
                            <td style={{ fontWeight: 600 }}>#{o.id}</td>
                            <td>
                              <div style={{ fontWeight: 500 }}>{o.full_name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.email}</div>
                            </td>
                            <td>{o.order_type}</td>
                            <td>${parseFloat(o.total_amount).toFixed(2)}</td>
                            <td>
                              <span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="glass-panel" style={{ ...styles.dashboardPanel, flex: 1 }}>
                  <h3 style={styles.panelTitle}>Low Stock Items</h3>
                  <div style={styles.stockAlerts}>
                    {products.filter(p => p.stock_quantity <= 5).map(p => (
                      <div key={p.id} style={styles.stockAlertRow}>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Brand: {p.brand_name}</div>
                        </div>
                        <span style={{ 
                          fontSize: '0.8rem', 
                          fontWeight: 700, 
                          color: p.stock_quantity === 0 ? 'var(--danger)' : 'var(--warning)',
                          background: p.stock_quantity === 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: 'var(--radius-sm)'
                        }}>
                          {p.stock_quantity} left
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BRANDS */}
          {activeTab === 'brands' && (
            <div>
              <div style={styles.tabTitleRow}>
                <h2>Brands List</h2>
                <button onClick={() => { setEditBrand(null); setBrandName(''); setBrandDesc(''); setShowBrandModal(true); }} className="btn btn-primary btn-sm">
                  <PlusCircle size={16} />
                  <span>Create Brand</span>
                </button>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Brand Name</th>
                      <th>Description</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brands.map(b => (
                      <tr key={b.id}>
                        <td>{b.id}</td>
                        <td style={{ fontWeight: 600 }}>{b.name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{b.description || 'N/A'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button onClick={() => { setEditBrand(b); setBrandName(b.name); setBrandDesc(b.description || ''); setShowBrandModal(true); }} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleBrandDelete(b.id)} className="btn btn-danger btn-sm" style={{ padding: '0.4rem' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS */}
          {activeTab === 'products' && (
            <div>
              <div style={styles.tabTitleRow}>
                <h2>Products Catalog</h2>
                <button onClick={() => {
                  setEditProduct(null);
                  setPName('');
                  setPBrandId(brands[0]?.id || '');
                  setPDesc('');
                  setPPrice('');
                  setPStock('0');
                  setPPreorder(false);
                  setPPreorderDate('');
                  setPImageUrl('');
                  setPImageFile(null);
                  setShowProductModal(true);
                }} className="btn btn-primary btn-sm">
                  <PlusCircle size={16} />
                  <span>Add Product</span>
                </button>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Thumbnail</th>
                      <th>Product Info</th>
                      <th>Brand</th>
                      <th>Unit Price</th>
                      <th>Stock Qty</th>
                      <th>Order Mode</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ width: '45px', height: '45px', background: '#1A2333', borderRadius: 'var(--radius-sm)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={p.image_url} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '300px' }}>{p.description}</div>
                        </td>
                        <td>{p.brand_name || brands.find(b => parseInt(b.id) === parseInt(p.brand_id))?.name || 'N/A'}</td>
                        <td style={{ fontWeight: 600 }}>${parseFloat(p.price).toFixed(2)}</td>
                        <td>
                          <span style={{ 
                            fontWeight: 600, 
                            color: p.stock_quantity === 0 ? 'var(--danger)' : 'inherit' 
                          }}>
                            {p.stock_quantity}
                          </span>
                        </td>
                        <td>
                          {p.preorder_available === 1 ? (
                            <span className="badge badge-pending">PRE-ORDER</span>
                          ) : (
                            <span className="badge badge-paid">IN STOCK</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button onClick={() => {
                              setEditProduct(p);
                              setPName(p.name);
                              setPBrandId(p.brand_id);
                              setPDesc(p.description || '');
                              setPPrice(p.price);
                              setPStock(p.stock_quantity);
                              setPPreorder(p.preorder_available === 1);
                              setPPreorderDate(p.preorder_release_date ? p.preorder_release_date.substring(0, 10) : '');
                              setPImageUrl(p.image_url || '');
                              setPImageFile(null);
                              setShowProductModal(true);
                            }} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleProductDelete(p.id)} className="btn btn-danger btn-sm" style={{ padding: '0.4rem' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <div style={styles.tabTitleRow}>
                <h2>Orders List &amp; Status Controls</h2>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Details</th>
                      <th>Order Mode</th>
                      <th>Placed Time</th>
                      <th>Total Amount</th>
                      <th>Status Badge</th>
                      <th>Change Status</th>
                      <th style={{ textAlign: 'right' }}>Clean</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td style={{ fontWeight: 700 }}>#{o.id}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{o.full_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.email}</div>
                        </td>
                        <td>{o.order_type}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(o.ordered_at).toLocaleString()}
                        </td>
                        <td style={{ fontWeight: 600 }}>${parseFloat(o.total_amount).toFixed(2)}</td>
                        <td>
                          <span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span>
                        </td>
                        <td>
                          <select 
                            value={o.status} 
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                            style={{ 
                              background: 'rgba(4,6,10,0.6)', 
                              border: '1px solid var(--border-color)', 
                              borderRadius: 'var(--radius-sm)', 
                              color: 'var(--text-main)', 
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PAID">PAID</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => handleOrderDelete(o.id)} className="btn btn-danger btn-sm" style={{ padding: '0.4rem' }}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: INVENTORY LOGS */}
          {activeTab === 'inventory' && (
            <div>
              <div style={styles.tabTitleRow}>
                <h2>Inventory Movements Tracker</h2>
                <button onClick={() => {
                  setStockProductId(products[0]?.id || '');
                  setStockAction('ADD');
                  setStockQty('');
                  setShowStockModal(true);
                }} className="btn btn-primary btn-sm">
                  <PlusCircle size={16} />
                  <span>Log Movement</span>
                </button>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Log ID</th>
                      <th>Product Item</th>
                      <th>Action</th>
                      <th>Quantity Changed</th>
                      <th>Performed By</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryLogs.map(l => (
                      <tr key={l.id}>
                        <td>{l.id}</td>
                        <td style={{ fontWeight: 600 }}>{l.product_name}</td>
                        <td>
                          <span style={{ 
                            fontWeight: 700, 
                            color: l.action_type === 'ADD' ? 'var(--success)' : 'var(--danger)',
                            background: l.action_type === 'ADD' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.8rem'
                          }}>
                            {l.action_type}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700 }}>
                          {l.action_type === 'ADD' ? '+' : '-'}{l.quantity_changed}
                        </td>
                        <td>{l.performed_by_name || 'System Operator'}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(l.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: BRANDS (CREATE / EDIT) */}
      {showBrandModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {editBrand ? 'Edit Brand Information' : 'Create Brand'}
              </h3>
              <button onClick={() => setShowBrandModal(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleBrandSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Brand Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Samsung" 
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description / Series Details</label>
                  <textarea 
                    className="form-control" 
                    rows={4}
                    placeholder="Samsung flagship and middle series smartphones..." 
                    value={brandDesc}
                    onChange={(e) => setBrandDesc(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowBrandModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <Check size={14} />
                  <span>{editBrand ? 'Save Changes' : 'Create Brand'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRODUCTS (CREATE / EDIT) */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {editProduct ? 'Edit Product Item' : 'Add Product'}
              </h3>
              <button onClick={() => setShowProductModal(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleProductSubmit}>
              <div className="modal-body">
                <div style={styles.ccRow}>
                  <div className="form-group" style={{ flex: 1.5 }}>
                    <label className="form-label">Product Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="iPhone 15 Pro" 
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Brand Category</label>
                    <select 
                      className="form-control"
                      value={pBrandId}
                      onChange={(e) => setPBrandId(e.target.value)}
                      required
                    >
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Product Description</label>
                  <textarea 
                    className="form-control" 
                    rows={3}
                    placeholder="Provide details about camera, chip, display, etc..." 
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                  />
                </div>

                <div style={styles.ccRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Price ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="form-control" 
                      placeholder="999.99" 
                      value={pPrice}
                      onChange={(e) => setPPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Stock Quantity</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="20" 
                      value={pStock}
                      onChange={(e) => setPStock(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={styles.ccRow} className="form-group">
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="checkbox" 
                      id="preorder"
                      checked={pPreorder} 
                      onChange={(e) => setPPreorder(e.target.checked)}
                      style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                    />
                    <label htmlFor="preorder" style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>
                      Available for Pre-order
                    </label>
                  </div>

                  {pPreorder && (
                    <div style={{ flex: 1.2 }}>
                      <label className="form-label">Estimated Release Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={pPreorderDate}
                        onChange={(e) => setPPreorderDate(e.target.value)}
                        required={pPreorder}
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Product Image File</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setPImageFile(e.target.files[0])}
                    style={{ fontSize: '0.85rem' }}
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Or input an image URL link fallback below:</p>
                </div>

                <div className="form-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="https://images.unsplash.com/..." 
                    value={pImageUrl}
                    onChange={(e) => setPImageUrl(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowProductModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <Check size={14} />
                  <span>{editProduct ? 'Update Product' : 'Add Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL INVENTORY STOCK ADJUSTMENT */}
      {showStockModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Log Inventory Stock Movement</h3>
              <button onClick={() => setShowStockModal(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleStockSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Product Item</label>
                  <select 
                    className="form-control"
                    value={stockProductId}
                    onChange={(e) => setStockProductId(e.target.value)}
                    required
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_quantity})</option>
                    ))}
                  </select>
                </div>

                <div style={styles.ccRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Action Movement</label>
                    <select 
                      className="form-control"
                      value={stockAction}
                      onChange={(e) => setStockAction(e.target.value)}
                      required
                    >
                      <option value="ADD">ADD Stock (+)</option>
                      <option value="REMOVE">REMOVE Stock (-)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Quantity</label>
                    <input 
                      type="number" 
                      min="1"
                      className="form-control" 
                      placeholder="10" 
                      value={stockQty}
                      onChange={(e) => setStockQty(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowStockModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <Check size={14} />
                  <span>Update Stock Levels</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  centerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8rem 1.5rem',
    flex: 1,
    textAlign: 'center',
  },
  promptCard: {
    padding: '3rem 2.5rem',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '450px',
  },
  container: {
    padding: '2.5rem 1.5rem',
    flex: 1,
  },
  dashboardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  tabNavbar: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.5rem',
    borderRadius: 'var(--radius-md)',
    marginBottom: '2rem',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
  },
  tabBtn: (isActive) => ({
    background: isActive ? 'var(--primary)' : 'transparent',
    border: 'none',
    color: isActive ? 'white' : 'var(--text-muted)',
    padding: '0.6rem 1.25rem',
    fontWeight: isActive ? 600 : 500,
    fontSize: '0.9rem',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    boxShadow: isActive ? '0 4px 10px var(--primary-glow)' : 'none',
    ':hover': {
      color: 'var(--text-main)',
      background: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
    }
  }),
  tabContent: {
    minHeight: '400px',
  },
  tabCenterLoader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6rem 0',
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2.5rem',
  },
  metricCard: {
    padding: '1.5rem',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.4rem',
  },
  metricVal: {
    fontSize: '2rem',
    fontWeight: 800,
  },
  metricLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  dashboardSplit: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  dashboardPanel: {
    padding: '1.5rem',
    borderRadius: 'var(--radius-md)',
  },
  panelTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    marginBottom: '1.25rem',
  },
  stockAlerts: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  stockAlertRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    background: 'rgba(4,6,10,0.2)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
  },
  tabTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  closeBtn: {
    border: 'none',
    background: 'transparent',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
    ':hover': {
      color: 'var(--text-main)',
    }
  },
  ccRow: {
    display: 'flex',
    gap: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(99, 102, 241, 0.1)',
    borderTop: '3px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }
};
