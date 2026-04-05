import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import BulkUploadModal from "./BulkUploadModal";
import { useNavigate } from "react-router-dom";

const Products = () => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [openBulkModal, setOpenBulkModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    lowStockLimit: 10,
    category: "",
    supplier: "",
  });

  // ================= FETCH DATA =================
  const fetchProducts = useCallback(async (isSilent = false) => {
    const token = localStorage.getItem("pos-token");

    // 1. Immediate Redirect if token is missing
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const res = await axios.get("/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setProducts(res.data.products || []);
        setFilteredProducts(res.data.products || []);
        setCategories(res.data.categories || []);
        setSuppliers(res.data.suppliers || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      
      // 2. Redirect if Server returns 401 (Unauthorized) or 403 (Forbidden)
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("pos-token"); // Clean up dead token
        navigate("/login");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  // 3. Token Guard on Mount
  useEffect(() => {
    const token = localStorage.getItem("pos-token");
    if (!token) {
      navigate("/login");
    } else {
      fetchProducts();
    }
  }, [fetchProducts, navigate]);

  // ================= HANDLERS =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "price" || name === "stock" || name === "lowStockLimit") {
      const numValue = value === "" ? 0 : Number(value);
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const closeModal = () => {
    setOpenModal(false);
    setEditProduct(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      stock: 0,
      lowStockLimit: 10,
      category: "",
      supplier: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("pos-token");
    
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const url = editProduct
        ? `/api/products/${editProduct}`
        : "/api/products/add";
      const method = editProduct ? "put" : "post";

      const res = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        closeModal();
        fetchProducts(true);
      }
    } catch (error) {
      if (error.response?.status === 401) navigate("/login");
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (p) => {
    setEditProduct(p._id);
    setFormData({
      name: p.name,
      description: p.description || "",
      price: p.price,
      stock: p.stock,
      lowStockLimit: p.lowStockLimit || 10,
      category: p.category?.categoryName || "",
      supplier: p.supplier?.name || "",
    });
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This will affect your Dashboard totals.")) return;
    const token = localStorage.getItem("pos-token");
    
    try {
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts(true);
    } catch (error) {
      if (error.response?.status === 401) navigate("/login");
      console.error(error);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    const filtered = products.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(value);
      const categoryMatch = p.category?.categoryName?.toLowerCase().includes(value);
      return nameMatch || categoryMatch;
    });
    setFilteredProducts(filtered);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-xl font-bold text-muted">Loading Inventory...</p>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <div>
          <h1 className="text-3xl font-black text-primary flex items-center gap-2">
            Inventory Management
            {refreshing && <span className="badge badge-primary">Updating...</span>}
          </h1>
          <p className="text-muted">Manage your products, categories, and stock levels.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setOpenBulkModal(true)}
            className="btn btn-success"
          >
            Bulk Import
          </button>
          <button
            onClick={() => setOpenModal(true)}
            className="btn btn-primary"
          >
            + New Product
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>🔍</span>
            <input
              type="text"
              placeholder="Search products or categories..."
              onChange={handleSearch}
              className="input-field"
              style={{ paddingLeft: '2.5rem', marginBottom: 0 }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>S No.</th>
                <th>Product Details</th>
                <th>Category</th>
                <th>Pricing</th>
                <th>Stock Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? filteredProducts.map((p, i) => (
                <tr key={p._id}>
                  <td className="text-muted font-bold">{i + 1}</td>
                  <td>
                    <div className="font-bold text-primary">{p.name}</div>
                    <div className="text-xs text-muted" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description || "No description"}</div>
                  </td>
                  <td>
                    <span className="badge badge-primary">{p.category?.categoryName || "Uncategorized"}</span>
                  </td>
                  <td className="font-black text-success" style={{ fontSize: '1.125rem' }}>₹{p.price.toLocaleString()}</td>
                  <td>
                    <div className="flex-col">
                      <span className="font-bold" style={{ color: p.stock < (p.lowStockLimit || 10) ? 'var(--color-danger)' : 'inherit', fontSize: '0.875rem' }}>
                        {p.stock} units
                      </span>
                      {p.stock === 0 ? (
                        <span className="badge badge-danger">Out of Stock</span>
                      ) : p.stock < (p.lowStockLimit || 10) ? (
                        <span className="badge badge-warning">Low Stock</span>
                      ) : (
                        <span className="badge badge-success">In Stock</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(p)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Edit</button>
                      <button onClick={() => handleDelete(p._id)} className="btn btn-danger" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {openModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-primary">
                {editProduct ? "✏️ Modify Product" : "📦 New Product"}
              </h2>
              <button 
                onClick={closeModal} 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--color-text-muted)' }}
              >&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="flex-col gap-4">
              <div className="input-group">
                <label className="input-label">Product Name</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Wireless Mouse" className="input-field" required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Price (₹)</label>
                  <input type="number" name="price" value={formData.price === 0 ? "" : formData.price} onChange={handleChange} className="input-field" required />
                </div>
                <div className="input-group">
                  <label className="input-label">Current Stock</label>
                  <input type="number" name="stock" value={formData.stock === 0 ? "" : formData.stock} onChange={handleChange} className="input-field" />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Low Stock Alert Threshold</label>
                <input
                  type="number"
                  name="lowStockLimit"
                  value={formData.lowStockLimit === 0 ? "" : formData.lowStockLimit}
                  onChange={handleChange}
                  placeholder="Trigger alert when stock drops below..."
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="input-field" required>
                    <option value="">Select...</option>
                    {categories.map(c => <option key={c._id} value={c.categoryName}>{c.categoryName}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Supplier</label>
                  <select name="supplier" value={formData.supplier} onChange={handleChange} className="input-field" required>
                    <option value="">Select...</option>
                    {suppliers.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-2" style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editProduct ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BulkUploadModal
        isOpen={openBulkModal}
        onClose={() => setOpenBulkModal(false)}
        refreshProducts={() => fetchProducts(true)}
      />
    </div>
  );
};

export default Products;