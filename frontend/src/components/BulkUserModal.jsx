import React, { useState } from "react";
import axios from "axios";

const BulkUserModal = ({ isOpen, onClose, refreshUsers }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select an Excel or JSON file.");

    const formData = new FormData();
    formData.append("file", file); // Must match upload.single('file') in backend

    setLoading(true);
    try {
      const token = localStorage.getItem("pos-token");
      const res = await axios.post("/api/users/bulk-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        alert(res.data.message || "Bulk users added!");
        refreshUsers(); // Reload the user list
        onClose(); 
      }
    } catch (error) {
      alert(error.response?.data?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <h2 className="text-xl font-bold mb-2">Bulk User Import</h2>
        <p className="text-sm text-muted mb-6" style={{ textAlign: 'center' }}>
          Upload an Excel file with columns: <b>name, email, password, address, role</b>.
        </p>
        
        <button style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-text-muted)' }} onClick={onClose}>✕</button>

        <div className="flex-col gap-4">
          <input 
            type="file" 
            accept=".xlsx, .xls, .json" 
            onChange={handleFileChange} 
            className="input-field"
            style={{ padding: '0.5rem', fontSize: '0.875rem' }}
          />

          <div className="flex gap-2">
            <button 
              onClick={handleUpload} 
              disabled={loading || !file}
              className="btn btn-primary" style={{ flex: 1 }}
            >
              {loading ? "Processing..." : "Confirm Upload"}
            </button>
            <button onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUserModal;