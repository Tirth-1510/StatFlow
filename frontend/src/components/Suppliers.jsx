import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";

const Suppliers = () => {
  const [addModel, setAddModel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [editSupplier, setEditSupplier] = useState(null);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    address: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchSuppliers = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const response = await axios.get("/api/supplier", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });
      setSuppliers(response.data.suppliers || []);
      setFilteredSuppliers(response.data.suppliers || []);
    } catch (error) {
      console.error("Error fetching suppliers", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleEdit = (supplier) => {
    setFormData({
      name: supplier.name,
      email: supplier.email || "",
      number: supplier.number,
      address: supplier.address || "",
    });
    setEditSupplier(supplier._id);
    setAddModel(true);
  };

  const closeModel = () => {
    setAddModel(false);
    setEditSupplier(null);
    setFormData({
      name: "",
      email: "",
      number: "",
      address: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.number) {
      alert("Name and Phone Number are required");
      return;
    }

    try {
      const url = editSupplier
        ? `/api/supplier/${editSupplier}`
        : "/api/supplier/add";

      const method = editSupplier ? "put" : "post";

      const response = await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });

      if (response.data.success) {
        fetchSuppliers(true);
        closeModel();
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Server error.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This will remove this supplier from your database.")) return;

    try {
      const response = await axios.delete(`/api/supplier/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });

      if (response.data.success) {
        fetchSuppliers(true);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Error deleting supplier.");
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setFilteredSuppliers(
      suppliers.filter((s) => s.name.toLowerCase().includes(value) || s.email?.toLowerCase().includes(value))
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-xl font-bold text-muted">Loading Suppliers...</p>
    </div>
  );

  return (
    <div>
      {/* Header Section */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <div>
          <h1 className="text-3xl font-black text-primary flex items-center gap-2">
            Supplier Management
            {refreshing && <span className="badge badge-primary">Updating...</span>}
          </h1>
          <p className="text-muted">Manage your business partners and supply chain contacts.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setAddModel(true)}
        >
          + Add Supplier
        </button>
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>🔍</span>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="input-field"
              style={{ paddingLeft: '2.5rem', marginBottom: 0 }}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>S No</th>
                <th>Supplier Name</th>
                <th>Contact Details</th>
                <th>Address</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((supplier, index) => (
                  <tr key={supplier._id}>
                    <td className="text-muted font-bold">{index + 1}</td>
                    <td>
                      <div className="font-bold text-primary">{supplier.name}</div>
                    </td>
                    <td>
                      <div className="text-sm font-semibold text-primary">{supplier.number}</div>
                      <div className="text-xs text-muted">{supplier.email || "No email provided"}</div>
                    </td>
                    <td>
                      <div className="text-sm text-muted" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{supplier.address || "N/A"}</div>
                    </td>
                    <td>
                      <div className="flex justify-center gap-2">
                        <button
                          className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => handleEdit(supplier)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => handleDelete(supplier._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    No suppliers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Floating Modal */}
      {addModel && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-primary">
                {editSupplier ? "✏️ Edit Supplier" : "🤝 New Supplier"}
              </h2>
              <button onClick={closeModel} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--color-text-muted)' }}>✕</button>
            </div>

            <form className="flex-col gap-4" onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corp"
                  className="input-field"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@supplier.com"
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    placeholder="+91 00000 00000"
                    className="input-field"
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Office Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="City, State"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex gap-2" style={{ marginTop: '1rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary" style={{ flex: 1 }}
                >
                  {editSupplier ? "Update Contact" : "Create Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;