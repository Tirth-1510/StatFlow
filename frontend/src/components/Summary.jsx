import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, AreaChart, Area
} from 'recharts';

const Summary = () => {
    const navigate = useNavigate();
    
    // 1. New state to ensure the DOM is fully ready
    const [isMounted, setIsMounted] = useState(false); 
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        totalProducts: 0,
        totalStock: 0,
        orderToday: 0,
        revenue: 0,
        outOfStock: [],
        highestSaleProduct: null,
        lowStock: [],
        dailySales: [], 
        monthlySales: [] 
    });

    const fetchDashboardData = useCallback(async () => {
        const token = localStorage.getItem('pos-token');
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get("/api/dashboard", {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const data = response.data.dashboardData || {};
            setDashboardData({
                ...data,
                dailySales: (data.dailySales || []).sort((a, b) => a._id - b._id),
                monthlySales: (data.monthlySales || []).sort((a, b) => a._id - b._id),
                outOfStock: data.outOfStock || [],
                lowStock: data.lowStock || []
            });
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem("pos-token");
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchDashboardData();
        // 2. Trigger "Mounted" after the first render cycle
        setIsMounted(true); 
    }, [fetchDashboardData]);

    const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // 3. Keep the loading guard to prevent UI flashes
    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen">
                <p className="text-xl font-bold text-muted">Syncing Inventory...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-primary">Dashboard Overview</h2>
                <button 
                    onClick={fetchDashboardData}
                    className="btn btn-outline"
                >
                    Refresh Stats
                </button>
            </div>

            {/* Row 1: Statistic Boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)', color: 'white' }}>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 900, opacity: 0.8, letterSpacing: '0.05em' }}>Total Products</p>
                    <p className="text-4xl font-black mt-2">{dashboardData.totalProducts}</p>
                </div>
                <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--color-success) 0%, var(--color-success-hover) 100%)', color: 'white' }}>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 900, opacity: 0.8, letterSpacing: '0.05em' }}>Available Stock</p>
                    <p className="text-4xl font-black mt-2">{dashboardData.totalStock}</p>
                </div>
                <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--color-warning) 0%, var(--color-warning-hover) 100%)', color: 'white' }}>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 900, opacity: 0.8, letterSpacing: '0.05em' }}>Orders Today</p>
                    <p className="text-4xl font-black mt-2">{dashboardData.orderToday}</p>
                </div>
                <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--color-danger) 0%, var(--color-danger-hover) 100%)', color: 'white' }}>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 900, opacity: 0.8, letterSpacing: '0.05em' }}>Total Revenue</p>
                    <p className="text-4xl font-black mt-2">₹{(dashboardData.revenue || 0).toLocaleString()}</p>
                </div>
            </div>

            {/* Row 2: Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '2rem' }}>
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-primary">Daily Sales Performance</h3>
                        <p className="text-xs font-bold text-muted uppercase" style={{ letterSpacing: '0.05em' }}>Current Month Data</p>
                    </div>
                    {/* 4. Fix: Container with explicit min-height and isMounted guard */}
                    <div style={{ height: '300px', width: '100%' }}>
                        {isMounted && (
                            <ResponsiveContainer width="99%" height="100%">
                                <BarChart data={dashboardData.dailySales}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: 'var(--color-text-muted)'}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: 'var(--color-text-muted)'}} />
                                    <Tooltip 
                                        cursor={{fill: 'var(--color-background)'}} 
                                        contentStyle={{borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)', fontWeight: 800}}
                                        formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} 
                                    />
                                    <Bar dataKey="total" fill="var(--color-primary)" radius={[6, 6, 0, 0]} barSize={18} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="card" style={{ padding: '2rem' }}>
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-primary">Annual Revenue Trend</h3>
                        <p className="text-xs font-bold text-muted uppercase" style={{ letterSpacing: '0.05em' }}>Monthly Growth</p>
                    </div>
                    <div style={{ height: '300px', width: '100%' }}>
                        {isMounted && (
                            <ResponsiveContainer width="99%" height="100%">
                                <AreaChart data={dashboardData.monthlySales}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                    <XAxis 
                                        dataKey="_id" 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{fontSize: 10, fontWeight: 700, fill: 'var(--color-text-muted)'}}
                                        tickFormatter={(tick) => monthNames[tick] || tick} 
                                        dy={10}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: 'var(--color-text-muted)'}} />
                                    <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)', fontWeight: 800}} />
                                    <Area type="monotone" dataKey="total" stroke="var(--color-success)" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={4} dot={{ r: 4, fill: 'var(--color-success)', stroke: '#fff', strokeWidth: 2 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Row 3: Alerts Section */}
            {/* Row 3: Alerts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--color-danger-light)' }}>
                    <h3 className="flex items-center text-sm font-black text-danger uppercase mb-4" style={{ letterSpacing: '0.05em' }}>
                        <span style={{ display: 'inline-block', height: '8px', width: '8px', borderRadius: '50%', backgroundColor: 'var(--color-danger)', marginRight: '8px' }}></span>
                        Critical Stock Alerts
                    </h3>
                    <div className="flex-col gap-2">
                        {dashboardData.outOfStock.length > 0 ? dashboardData.outOfStock.map((p, i) => (
                            <div key={i} className="flex justify-between items-center p-4 mb-2" style={{ backgroundColor: 'var(--color-danger-faint)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-danger-light)' }}>
                                <span className="font-bold" style={{ color: '#881337' }}>{p.name}</span>
                                <span className="badge badge-danger">Sold Out</span>
                            </div>
                        )) : <p className="text-muted text-sm italic">No out-of-stock items.</p>}
                    </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--color-warning-light)' }}>
                    <h3 className="flex items-center text-sm font-black text-warning uppercase mb-4" style={{ letterSpacing: '0.05em' }}>
                        <span style={{ display: 'inline-block', height: '8px', width: '8px', borderRadius: '50%', backgroundColor: 'var(--color-warning)', marginRight: '8px' }}></span>
                        Low Stock Warnings
                    </h3>
                    <div className="flex-col gap-2">
                        {dashboardData.lowStock.length > 0 ? dashboardData.lowStock.map((p, i) => (
                            <div key={i} className="flex justify-between items-center p-4 mb-2" style={{ backgroundColor: 'var(--color-warning-faint)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-warning-light)' }}>
                                <span className="font-bold" style={{ color: '#78350f' }}>{p.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-warning">{p.stock} Left</span>
                                    <span className="badge badge-warning" style={{ backgroundColor: 'white' }}>Limit: {p.lowStockLimit}</span>
                                </div>
                            </div>
                        )) : <p className="text-muted text-sm italic">All inventory levels are healthy.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Summary;