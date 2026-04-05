import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router'; // Note: Ensure this is 'react-router-dom'

const Logout = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        // 1. Perform the logout logic (updates AuthContext state)
        logout();
        
        // 2. Redirect the user to the login page
        // 'replace: true' prevents the user from going back to the logout route
        navigate("/login", { replace: true });
    }, [logout, navigate]);

    // A component must return JSX or null
    return null; 
}

export default Logout;