import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Categories = () => {
    const [categoryName, setCategoryName] = useState("");
    const [categoryDescription, setCategoryDescription] = useState("");
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [editCategory, setEditCategory] = useState(null);

    const fetchCategories = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);
        
        try {
            const response = await axios.get("/api/category", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                },
            });
            setCategories(response.data.categories || []);
        } catch (error) {
            console.error("Error fetching categories.", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editCategory 
                ? `/api/category/${editCategory}` 
                : "/api/category/add";
            const method = editCategory ? "put" : "post";

            const response = await axios[method](url, 
                { categoryName, categoryDescription },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                    },
                }
            );

            if (response.data.success) {
                setEditCategory(null);
                setCategoryName("");
                setCategoryDescription("");
                fetchCategories(true);
            }
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong");
        }
    };

    const handleEdit = (category) => {
        setEditCategory(category._id);
        setCategoryName(category.categoryName);
        setCategoryDescription(category.categoryDescription || "");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditCategory(null);
        setCategoryName("");
        setCategoryDescription("");
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? Products linked to this category may become uncategorized.")) {
            try {
                const response = await axios.delete(`/api/category/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                    },
                });
                if (response.data.success) {
                    fetchCategories(true);
                }
            } catch (error) {
                alert(error.response?.data?.message || "Error deleting category");
            }
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <p className="text-xl font-bold text-muted">Loading Categories...</p>
        </div>
    );

    return (
        <div>
            {/* Header Section */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
                <div>
                    <h1 className="text-3xl font-black text-primary flex items-center gap-2">
                        Category Management
                        {refreshing && <span className="badge badge-primary">Updating...</span>}
                    </h1>
                    <p className="text-muted">Organize your inventory by creating and managing product groups.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: '2rem' }}>
                {/* Form Section */}
                <div>
                    <div className="card sticky-sidebar" style={{ padding: '2rem' }}>
                        <h2 className="text-2xl font-black mb-6 text-primary">
                            {editCategory ? "✏️ Edit Category" : "📂 Add Category"}
                        </h2>
                        <form className="flex-col gap-4" onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label className="input-label">Category Name</label>
                                <input 
                                    type="text" 
                                    placeholder='e.g. Electronics'
                                    value={categoryName} 
                                    className="input-field"
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Description</label>
                                <textarea 
                                    placeholder='Briefly describe this category' 
                                    value={categoryDescription}
                                    className="input-field"
                                    style={{ height: '100px', resize: 'vertical' }}
                                    onChange={(e) => setCategoryDescription(e.target.value)} 
                                />
                            </div>
                            
                            <div className="flex-col gap-2 pt-2">
                                <button 
                                    type='submit'
                                    className="btn btn-primary" style={{ width: '100%' }}>
                                    {editCategory ? "Save Changes" : "Create Category"}
                                </button>
                                {editCategory && (
                                    <button
                                        type='button'
                                        className="btn btn-outline" style={{ width: '100%' }}
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Table Section */}
                <div>
                    <div className="card" style={{ padding: 0 }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                            <h2 className='text-xl font-black text-primary'>Active Categories</h2>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>S No.</th>
                                        <th>Category Name</th>
                                        <th>Description</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((category, index) => (
                                        <tr key={category._id}>
                                            <td className="text-muted font-bold" style={{ width: '80px' }}>
                                                {index + 1}
                                            </td>
                                            <td>
                                                <span className="font-bold text-primary">
                                                    {category.categoryName}
                                                </span>
                                            </td>
                                            <td className="text-muted text-sm" style={{ fontStyle: 'italic' }}>
                                                {category.categoryDescription || "No description provided"}
                                            </td>
                                            <td>
                                                <div className="flex justify-center gap-2">
                                                    <button 
                                                        onClick={() => handleEdit(category)}
                                                        className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(category._id)}
                                                        className="btn btn-danger" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {categories.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic', fontWeight: 500 }}>
                                                No categories found. Start by adding one!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Categories;