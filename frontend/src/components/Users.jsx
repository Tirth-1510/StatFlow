import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import BulkUserModal from './BulkUserModal'; 

const Users = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "",
    });
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [openBulkModal, setOpenBulkModal] = useState(false); 

    const fetchUsers = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);
        
        try {
            const response = await axios.get("/api/users", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                },
            });
            setUsers(response.data.users || []);
            setFilteredUsers(response.data.users || []);
        } catch (error) {
            console.error("Error fetching users.", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setFilteredUsers(
            users.filter((user) => 
                user.name.toLowerCase().includes(value) || 
                user.email.toLowerCase().includes(value)
            )
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                "/api/users/add",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                    },
                }
            );
            if (response.data.success) {
                setFormData({ name: "", email: "", password: "", address: "", role: "" });
                fetchUsers(true); // Silent refresh
            }
        } catch (error) {
            alert(error.response?.data?.message || "Error adding user.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? This will permanently remove this user account.")) {
            try {
                const response = await axios.delete(
                    `/api/users/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                        },
                    }
                );
                if (response.data.success) {
                    fetchUsers(true);
                }
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("Error deleting user.");
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <p className="text-xl font-bold text-muted">Loading User Records...</p>
        </div>
    );

    return (
        <div>
            {/* Header Section */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
                <div>
                    <h1 className='text-3xl font-black text-primary flex items-center gap-2'>
                        User Management
                        {refreshing && <span className="badge badge-primary">Updating...</span>}
                    </h1>
                    <p className='text-muted'>Create and monitor system users, admins, and customers.</p>
                </div>
                <button 
                    onClick={() => setOpenBulkModal(true)}
                    className="btn btn-success"
                >
                    Bulk Import Users
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: '2rem' }}>
                {/* Left side: Add User Form */}
                <div>
                    <div className="card sticky-sidebar" style={{ padding: '2rem' }}>
                        <h2 className="text-2xl font-black mb-6 text-primary">👤 New User</h2>
                        <form className="flex-col gap-4" onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label className="input-label">Full Name</label>
                                <input type="text" placeholder='John Doe' name='name' value={formData.name} className="input-field" onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Email Address</label>
                                <input type="email" placeholder='john@example.com' name='email' value={formData.email} className="input-field" onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Password</label>
                                <input type="password" placeholder='••••••••' name='password' value={formData.password} className="input-field" onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Assign Role</label>
                                <select name="role" value={formData.role} className="input-field" onChange={handleChange} required>
                                    <option value="">Select Role</option>
                                    <option value="admin">Admin</option>
                                    <option value="customer">Customer</option>
                                </select>
                            </div>
                            <button type='submit' className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                                Create Account
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right side: User Table */}
                <div>
                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>🔍</span>
                        <input 
                            type="text" 
                            placeholder='Search by name or email...' 
                            className="input-field shadow"
                            style={{ paddingLeft: '2.5rem', border: 'none' }}
                            onChange={handleSearch}
                        />
                    </div>

                    <div className="card" style={{ padding: 0 }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>S No.</th>
                                        <th>User Identity</th>
                                        <th>Role</th>
                                        <th style={{ textAlign: 'center' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user, index) => (
                                        <tr key={user._id}>
                                            <td className="text-muted font-bold" style={{ width: '80px' }}>{index + 1}</td>
                                            <td>
                                                <div className="font-bold text-primary">{user.name}</div>
                                                <div className="text-xs text-muted">{user.email}</div>
                                            </td>
                                            <td>
                                                <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-success'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button 
                                                    className="btn btn-danger" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                                                    onClick={() => handleDelete(user._id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic', fontWeight: 500 }}>
                                                No users found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Upload Modal */}
            <BulkUserModal 
                isOpen={openBulkModal} 
                onClose={() => setOpenBulkModal(false)} 
                refreshUsers={() => fetchUsers(true)} 
            />
        </div>
    );
};

export default Users;