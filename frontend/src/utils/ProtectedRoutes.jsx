import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoutes = ({ children, requireRole }) => {
    const { user } = useAuth();

    if (!user) {
        // User not logged in
        return <Navigate to="/login" replace />;
    }

    if (requireRole && !requireRole.includes(user.role)) {
        // User role not allowed
        return <Navigate to="/unauthorized" replace />;
    }

    // User is allowed
    return children;
};

export default ProtectedRoutes;
