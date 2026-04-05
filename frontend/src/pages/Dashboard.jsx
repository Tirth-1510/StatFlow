import React from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router'; // ✅ correct import

const Dashboard = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
            <Sidebar />
            <div className="main-content" style={{ flex: 1, marginLeft: '250px', padding: '2rem', transition: 'margin-left 0.3s' }}>
                <Outlet />
            </div>
        </div>
    );
}

export default Dashboard;
