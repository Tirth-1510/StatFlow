import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { NavLink } from 'react-router'; // ✅ fixed import
import {
  FaBox, FaCog, FaHome, FaShoppingCart,
  FaSignOutAlt, FaTable, FaTruck, FaUsers
} from 'react-icons/fa';

const Sidebar = () => {
  const menuItems = [
    { name: "Dashboard", path: "/admin-dashboard", icon: <FaHome />, isParent: true },
    { name: "Categories", path: "/admin-dashboard/categories", icon: <FaTable />, isParent: false },
    { name: "Products", path: "/admin-dashboard/products", icon: <FaBox />, isParent: false },
    { name: "Suppliers", path: "/admin-dashboard/suppliers", icon: <FaTruck />, isParent: false },
    { name: "Orders", path: "/admin-dashboard/orders", icon: <FaShoppingCart />, isParent: false },
    /*{ name: "Bill", path: "/admin-dashboard/bills", icon: <FaBill />, isParent: false },*/
    { name: "Users", path: "/admin-dashboard/users", icon: <FaUsers />, isParent: false },
    { name: "Profile", path: "/admin-dashboard/profile", icon: <FaCog />, isParent: false },
    { name: "Logout", path: "/admin-dashboard/logout", icon: <FaSignOutAlt />, isParent: false },
  ];

  const customerItems = [
    { name: "Products", path: "/customer-dashboard", icon: <FaBox />, isParent: true },
    { name: "Orders", path: "/customer-dashboard/orders", icon: <FaShoppingCart />, isParent: false },
    { name: "Profile", path: "/customer-dashboard/profile", icon: <FaCog />, isParent: false },
    { name: "Logout", path: "/customer-dashboard/logout", icon: <FaSignOutAlt />, isParent: false },
  ];

  const { user } = useAuth();
  const [menuLinks, setMenuLinks] = useState(customerItems);

  useEffect(() => {
    if (user && user.role === "admin") {
      setMenuLinks(menuItems);
    } else {
      setMenuLinks(customerItems);
    }
  }, [user]); // ✅ dependency array added

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#1C2141',
      color: 'white',
      width: '250px',
      position: 'fixed',
      boxShadow: 'var(--shadow-lg)'
    }}>
      <div style={{
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid #2F3568'
      }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary-light)' }}>StatFlow</span>
      </div>

      <ul style={{ listStyle: 'none', padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {menuLinks.map((item) => (
          <li key={item.name}>
            <NavLink
              end={item.isParent}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                transition: 'var(--transition-fast)',
                backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? 'white' : '#94a3b8',
                fontWeight: isActive ? '600' : '500'
              })}
            >
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              <span style={{ marginLeft: '1rem' }}>{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
