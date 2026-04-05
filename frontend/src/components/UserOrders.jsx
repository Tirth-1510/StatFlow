import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const UserOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyOrders = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const response = await axios.get("/api/orders/my", {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("pos-token")}` 
        },
      });

      if (response.data.success) {
        setMyOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching your orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-xl font-bold text-muted">Loading your history...</p>
    </div>
  );

  // Calculate total spent for a small summary card
  const totalSpent = myOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  return (
    <div>
      {/* Header Section */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <div>
          <h1 className="text-3xl font-black text-primary flex items-center gap-2">
            My Purchase History
            {refreshing && <span className="badge badge-primary">Updating...</span>}
          </h1>
          <p className="text-muted">View and track all your previous orders and receipts.</p>
        </div>
        
        <div className="card shadow" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--color-success)' }}>
            <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Spent</div>
            <div className="text-success" style={{ fontSize: '1.5rem', fontWeight: 900 }}>₹{totalSpent.toLocaleString()}</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>S No.</th>
                <th>Product Details</th>
                <th>Category</th>
                <th style={{ textAlign: 'center' }}>Quantity</th>
                <th>Total Price</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {myOrders.length > 0 ? (
                myOrders.map((order, index) => (
                  <tr key={order._id}>
                    <td className="text-muted font-bold" style={{ width: '80px' }}>{index + 1}</td>
                    <td>
                      <div className="font-bold text-primary">
                        {order.product?.name || "Unknown Product"}
                      </div>
                      <div className="text-xs text-muted font-bold uppercase tracking-widest">
                        Order ID: {order._id.slice(-6).toUpperCase()}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">
                        {order.product?.category?.categoryName || "General"}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="badge badge-success" style={{ display: 'inline-block' }}>
                        {order.quantity}
                      </div>
                    </td>
                    <td className="font-black text-primary" style={{ fontSize: '1.125rem' }}>
                      ₹{order.totalPrice?.toLocaleString()}
                    </td>
                    <td>
                      <div className="text-primary font-bold">
                        {new Date(order.orderDate).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric"
                        })}
                      </div>
                      <div className="text-xs text-muted">
                        {new Date(order.orderDate).toLocaleTimeString("en-GB", {
                          hour: "2-digit", minute: "2-digit", hour12: true
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '5rem', textAlign: 'center' }}>
                    <div className="flex-col items-center">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                        <p className="text-muted" style={{ fontStyle: 'italic', fontWeight: 500 }}>No purchase history found for your account.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button 
            onClick={() => fetchMyOrders(true)}
            style={{ color: 'var(--color-success)', fontWeight: 'bold', textDecoration: 'none', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            Refresh History
          </button>
      </div>
    </div>
  );
};

export default UserOrders;