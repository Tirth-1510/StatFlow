import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router'
import { useEffect } from 'react' // Added
import axios from 'axios' // Added
import Root from './utils/Root.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ProtectedRoutes from './utils/ProtectedRoutes.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Categories from './components/Categories.jsx'
import Suppliers from './components/Suppliers.jsx'
import Products from './components/Products.jsx'
import Logout from './components/Logout.jsx'
import Users from './components/Users.jsx'
import CustomerProducts from './components/CustomerProducts.jsx'
import Profile from './components/Profile.jsx'
import Summary from './components/Summary.jsx'
import AdminOrders from './components/AdminOrders.jsx'
import UserOrders from './components/UserOrders.jsx'

function App() {

  // ================= GLOBAL AUTH INTERCEPTOR =================
  // This catches any 401 error across the whole app and redirects to login
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("pos-token");
          localStorage.removeItem("pos-user"); // Optional: clear user data too
          window.location.href = "/login"; // Force a full refresh to login
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return (
    <Router>
      <Routes>
        {/* INITIAL REDIRECT LOGIC */}
        <Route path="/" element={<Root />} />

        {/* AUTHENTICATION ROUTES */}
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
    </Router>
  )
}

export default App