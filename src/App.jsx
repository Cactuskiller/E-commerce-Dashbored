import React from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import ProductsScreen from "./pages/Screens/products/ProductsScreen";
import CategoriesScreen from "./pages/Screens/categories/CategoriesScreen";
import OrdersScreen from "./pages/Screens/orders/OrdersScreen";
import BannersScreen from "./pages/Screens/banner/BannersScreen";
import UsersScreen from "./pages/Screens/users/UsersScreen";
import VouchersScreen from "./pages/Screens/vouchers/VouchersScreen";
import AntLayout from "./components/AntLayout";
import Auth from "./pages/Auth";

export default function App() {
  const navigate = useNavigate();

  // 🔥 ADD: Logout handler
  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    
    // Redirect to auth page
    navigate('/auth');
    
    console.log('User logged out');
  };

  return (
    <Routes>
      {/* Auth Route - Outside Layout */}
      <Route path="/auth" element={<Auth />} />
      
      {/* All other routes use Layout */}
      <Route path="/*" element={
        <AntLayout 
          onMenuClick={(key) => navigate(`/${key}`)}
          onLogout={handleLogout} 
        >
          <Routes>
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="/products" element={<ProductsScreen />} />
            <Route path="/categories" element={<CategoriesScreen />} />
            <Route path="/orders" element={<OrdersScreen />} />
            <Route path="/banners" element={<BannersScreen />} />
            <Route path="/users" element={<UsersScreen />} />
            <Route path="/vouchers" element={<VouchersScreen />} />
          </Routes>
        </AntLayout>
      } />
    </Routes>
  );
}