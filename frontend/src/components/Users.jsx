import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BulkUserModal from './BulkUserModal'; 

const Users = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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
                    <p className='text-muted'>Monitor system users, admins, and customers.</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* User Table */}
                <div style={{ width: '100%' }}>
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
                                            <td style={{ textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                {user.role === 'customer' && (
                                                    <button 
                                                        className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                                                        onClick={() => navigate('/admin-dashboard/place-order', { state: { targetCustomerId: user._id, targetCustomerName: user.name } })}
                                                    >
                                                        Place Order
                                                    </button>
                                                )}
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

        </div>
    );
};

export default Users;