import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CustomerProducts = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [orderData, setOrderData] = useState({
    productId: "",
    quantity: 1,
    total: 0,
    stock: 0,
    price: 0,
  });

  // ================= FETCH DATA =================
  const fetchProducts = useCallback(async () => {
    const token = localStorage.getItem("pos-token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setProducts(res.data.products);
        setFilteredProducts(res.data.products);
        setCategories(res.data.categories);
      }
    } catch (error) {
      console.error("Error fetching products.", error);
      if (error.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ================= HANDLERS =================
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    const results = products.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(value);
      const categoryMatch = p.category?.categoryName?.toLowerCase().includes(value);
      return nameMatch || categoryMatch;
    });
    setFilteredProducts(results);
  };

  const handleChangeCategory = (e) => {
    const categoryId = e.target.value;
    if (!categoryId) {
      setFilteredProducts(products);
      return;
    }
    setFilteredProducts(products.filter((p) => p.category?._id === categoryId));
  };

  const handleOrderChange = (product) => {
    if (product.stock <= 0) {
      alert("Out of stock!");
      return;
    }
    setOrderData({
      productId: product._id,
      quantity: 1,
      total: product.price,
      stock: product.stock,
      price: product.price,
    });
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setIsSubmitting(false);
  };

  const handleQuantityChange = (e) => {
    let qty = parseInt(e.target.value);
    if (isNaN(qty) || qty < 1) qty = 1;
    
    // Prevent manual entry higher than stock
    if (qty > orderData.stock) {
      qty = orderData.stock;
    }
    
    setOrderData((prev) => ({
      ...prev,
      quantity: qty,
      total: qty * prev.price,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("pos-token");
    if (!token) return navigate("/login");

    try {
      setIsSubmitting(true);
      const response = await axios.post(
        "/api/orders/add",
        {
          product: orderData.productId,
          quantity: orderData.quantity,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setOpenModal(false);
        alert("Order placed successfully");
        fetchProducts(); // Refresh stock counts
      }
    } catch (error) {
      if (error.response?.status === 401) navigate("/login");
      alert(error.response?.data?.message || "Error placing order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-xl font-bold text-muted">Loading Marketplace...</p>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <div>
          <h2 className="text-3xl font-black text-primary uppercase">Marketplace</h2>
          <p className="text-muted">Browse products and place your orders.</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' }}>
        <div className="flex-col gap-2">
          <label className="input-label" style={{ marginBottom: 0 }}>Filter By Category</label>
          <select
            className="input-field shadow"
            style={{ width: '250px', marginBottom: 0 }}
            onChange={handleChangeCategory}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
            ))}
          </select>
        </div>

        <div className="flex-col gap-2" style={{ flex: 1, maxWidth: '400px' }}>
          <label className="input-label" style={{ marginBottom: 0 }}>Search Products</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>🔍</span>
            <input
              type="text"
              placeholder="Search by name or category..."
              onChange={handleSearch}
              className="input-field shadow"
              style={{ paddingLeft: '2.5rem', marginBottom: 0 }}
            />
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>S No.</th>
                <th>Product Details</th>
                <th>Category</th>
                <th>Price</th>
                <th>Availability</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p, i) => (
                  <tr key={p._id}>
                    <td className="text-muted font-bold" style={{ width: '80px' }}>{i + 1}</td>
                    <td>
                      <div className="font-bold text-primary">{p.name}</div>
                    </td>
                    <td>
                      <span className="badge badge-primary">
                        {p.category?.categoryName || "General"}
                      </span>
                    </td>
                    <td className="font-black text-success" style={{ fontSize: '1.125rem' }}>₹{p.price.toLocaleString()}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div style={{ width: '0.625rem', height: '0.625rem', borderRadius: '50%', backgroundColor: p.stock > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}></div>
                        <span className="font-bold" style={{ color: p.stock < 10 ? 'var(--color-danger)' : 'var(--color-text)' }}>
                          {p.stock > 0 ? `${p.stock} Units Left` : 'Sold Out'}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleOrderChange(p)}
                        disabled={p.stock <= 0}
                        className={p.stock > 0 ? "btn btn-primary shadow" : "btn btn-outline"} 
                        style={{ width: '100%', maxWidth: '120px', margin: '0 auto', opacity: p.stock <= 0 ? 0.5 : 1 }}
                      >
                        {p.stock > 0 ? "Order Now" : "Out of Stock"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic', fontWeight: 500 }}>
                    No products found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Modal */}
      {openModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-black text-primary">🛒 Order</h1>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--color-text-muted)' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="flex-col gap-6">
              <div className="input-group">
                <label className="input-label" style={{ textAlign: 'center' }}>Quantity to buy</label>
                <input
                  type="number"
                  value={orderData.quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  max={orderData.stock}
                  className="input-field shadow"
                  style={{ textAlign: 'center', fontSize: '1.5rem', padding: '1rem', fontWeight: 900, color: 'var(--color-primary)' }}
                  required
                />
                <p className="text-muted" style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.875rem' }}>Available Stock: {orderData.stock}</p>
              </div>
              
              <div style={{ backgroundColor: 'var(--color-success-faint)', border: '2px solid var(--color-success)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Payable</span>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-success)' }}>₹{orderData.total.toLocaleString()}</div>
              </div>

              <div className="flex-col gap-2 mt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={isSubmitting ? "btn btn-outline" : "btn btn-primary"}
                  style={{ padding: '1rem', fontSize: '1.125rem' }}
                >
                  {isSubmitting ? "Processing..." : "Confirm & Pay"}
                </button>
                <button type="button" onClick={closeModal} className="btn" style={{ background: 'transparent', color: 'var(--color-text-muted)' }}>Nevermind, go back</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProducts;