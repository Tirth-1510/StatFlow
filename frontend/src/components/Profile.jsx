import React, { useEffect, useState, useCallback } from "react";
import axios from 'axios';

const Profile = () => {
    // 1. Initialize State
    const [user, setUser] = useState({
        name: "",
        email: "",
        address: "",
        password: ""
    });
    const [originalUser, setOriginalUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    // 2. Fetch Data from Backend
    const fetchUser = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("pos-token");
            const response = await axios.get("/api/users/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                const fetchedData = {
                    name: response.data.user.name || "",
                    email: response.data.user.email || "",
                    address: response.data.user.address || "",
                    password: "" // Keep empty for security
                };
                setUser(fetchedData);
                setOriginalUser(fetchedData);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            alert("Could not load profile.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // 3. Centralized Input Handler (Enables Typing)
    const onInputChange = (e) => {
        const { name, value } = e.target;
        setUser((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // 4. Toggle Edit Mode (Does NOT trigger popup)
    const enableEdit = (e) => {
        e.preventDefault(); // Stop any form submission
        setIsEditing(true);
    };

    // 5. Cancel Logic
    const handleCancel = () => {
        setUser(originalUser);
        setIsEditing(false);
    };

    // 6. Final Update Logic (Triggers Popup)
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("pos-token");
            const response = await axios.put("/api/users/profile", user, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                alert("Details updated successfully!"); // Popup shows here
                setOriginalUser(user);
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Update Error:", error);
            alert("Failed to update profile. Check backend logs.");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <p className="text-xl font-black text-primary">Loading Profile...</p>
        </div>
    );

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-primary mb-2">Account Settings</h1>
                <p className="text-muted">Update your information below.</p>
            </div>

            {/* Form Container */}
            <form className="card p-8" onSubmit={handleUpdate}>
                
                {/* User Header Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ height: '80px', width: '80px', backgroundColor: 'var(--color-primary-faint)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>👤</div>
                    <div>
                        <h2 className="text-2xl font-black">{user.name || "User"}</h2>
                        <span className={`badge ${isEditing ? 'badge-primary' : 'badge-warning'}`}>
                            {isEditing ? "Editing Mode" : "View Mode"}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {/* Full Name */}
                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <input 
                            name="name" 
                            type="text" 
                            value={user.name} 
                            onChange={onInputChange}
                            disabled={!isEditing}
                            className="input-field"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <input 
                            name="email" 
                            type="email" 
                            value={user.email} 
                            onChange={onInputChange}
                            disabled={!isEditing}
                            className="input-field"
                            required
                        />
                    </div>

                    {/* Address */}
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label className="input-label">Address</label>
                        <input 
                            name="address" 
                            type="text" 
                            value={user.address} 
                            onChange={onInputChange}
                            disabled={!isEditing}
                            className="input-field"
                        />
                    </div>

                    {/* Password (Visible only when editing) */}
                    {isEditing && (
                        <div className="input-group" style={{ gridColumn: 'span 2' }}>
                            <label className="input-label" style={{ color: 'var(--color-primary)' }}>New Password (Leave blank to keep current)</label>
                            <input 
                                name="password"
                                type="password" 
                                value={user.password}
                                onChange={onInputChange}
                                className="input-field"
                                style={{ borderColor: 'var(--color-primary-light)' }}
                            />
                        </div>
                    )}
                </div>

                {/* Bottom Buttons */}
                <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                    {!isEditing ? (
                        <button 
                            type="button" 
                            onClick={enableEdit}
                            className="btn btn-primary" style={{ flex: 1 }}
                        >
                            Edit Profile Details
                        </button> 
                    ) : (
                        <>
                            <button 
                                type="submit"
                                className="btn btn-success" style={{ flex: 1 }}
                            >
                                Update Details
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="btn btn-outline" style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
};

export default Profile;