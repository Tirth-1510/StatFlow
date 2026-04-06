import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router'
import React, { useEffect, Suspense, lazy } from 'react'
import axios from 'axios'

// --- LAZY LOADED COMPONENTS (Massive Performance Boost) ---
// These files will only be downloaded to the user's browser right before they click on the page.
const Root = lazy(() => import('./utils/Root.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const ProtectedRoutes = lazy(() => import('./utils/ProtectedRoutes.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Categories = lazy(() => import('./components/Categories.jsx'))
const Suppliers = lazy(() => import('./components/Suppliers.jsx'))
const Products = lazy(() => import('./components/Products.jsx'))
const Logout = lazy(() => import('./components/Logout.jsx'))
const Users = lazy(() => import('./components/Users.jsx'))
const CustomerProducts = lazy(() => import('./components/CustomerProducts.jsx'))
const Profile = lazy(() => import('./components/Profile.jsx'))
const Summary = lazy(() => import('./components/Summary.jsx'))
const AdminOrders = lazy(() => import('./components/AdminOrders.jsx'))
const UserOrders = lazy(() => import('./components/UserOrders.jsx'))

// Fallback Loading Screen to show while downloading chunks
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
    <div className="flex-col items-center">
      <div style={{
          width: '50px', height: '50px', borderRadius: '50%',
          border: '4px solid var(--color-primary-faint)', borderTopColor: 'var(--color-primary)',
          animation: 'spin 1s linear infinite'
      }}></div>
      <p className="mt-4 text-muted font-bold tracking-wide">Loading Interface...</p>
    </div>
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {

  // ================= GLOBAL AUTH INTERCEPTOR =================
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("pos-token");
          localStorage.removeItem("pos-user");
          window.location.href = "/login"; 
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return (
    <Router>
      {/* Suspense boundary catches the lazy loads and shows the spinner seamlessly */}
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Root />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ADMIN DASHBOARD - FULLY PROTECTED */}
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoutes requireRole={["admin"]}>
                <Dashboard />
              </ProtectedRoutes>
            }
          >
            <Route index element={<Summary />} />
            <Route path='categories' element={<Categories />} />
            <Route path='products' element={<Products />} />
            <Route path='suppliers' element={<Suppliers />} />
            <Route path='orders' element={<AdminOrders />} />
            <Route path='users' element={<Users />} />
            <Route path='profile' element={<Profile />} />
            <Route path='logout' element={<Logout />} />
          </Route>

          {/* CUSTOMER DASHBOARD - PROTECTED */}
          <Route 
            path="/customer-dashboard" 
            element={
              <ProtectedRoutes requireRole={["customer", "admin"]}>
                <Dashboard />
              </ProtectedRoutes>
            } 
          >
            <Route index element={<CustomerProducts />} />
            <Route path='orders' element={<UserOrders />} />
            <Route path='logout' element={<Logout />} />
            <Route path='profile' element={<Profile />} />
          </Route>

          {/* ERROR ROUTES */}
          <Route path="/unauthorized" element={
            <div className="flex flex-col items-center justify-center h-screen">
              <h1 className="text-4xl font-black text-danger">Unauthorized</h1>
              <p className="mt-4 text-muted">You do not have permission to access this page.</p>
            </div>
          } />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-screen">
              <h1 className="text-4xl font-black text-muted">404 - Page Not Found</h1>
            </div>
          } />
          
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App