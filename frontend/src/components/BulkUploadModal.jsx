import React, { useState } from "react";
import axios from "axios";

const BulkUploadModal = ({ isOpen, onClose, refreshProducts }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // If the modal isn't open, return nothing
  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select an Excel or JSON file first.");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const token = localStorage.getItem("pos-token");
      const res = await axios.post("/api/products/bulk-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        alert(res.data.message || "Bulk upload successful!");
        refreshProducts();
        onClose(); // Close the modal on success
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Upload failed. Check file format.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '450px' }}>
        <h2 className="text-xl font-bold mb-4">Bulk Upload Products</h2>
        
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-text-muted)' }}
        >
          ✕
        </button>

        <div className="flex-col gap-4">
          <div style={{ border: '2px dashed var(--color-border)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', backgroundColor: 'var(--color-surface)' }}>
            <p className="text-sm text-muted mb-3">Select your Excel (.xlsx) or JSON file</p>
            <input 
              type="file" 
              accept=".xlsx, .xls, .json" 
              onChange={handleFileChange} 
              style={{ width: '100%', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ backgroundColor: 'var(--color-primary-faint)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--color-primary)' }}>
            <strong>Note:</strong> Ensure your file columns match the required database fields (name, price, stock, categories, suppliers).
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleUpload} 
              disabled={loading || !file}
              className="btn btn-success" style={{ flex: 1 }}
            >
              {loading ? "Uploading..." : "Confirm Upload"}
            </button>
            <button 
              onClick={onClose} 
              className="btn btn-outline" style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;