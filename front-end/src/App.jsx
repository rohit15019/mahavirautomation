import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AdminRoute from './AdminRoute';
import UserRoute from './UserRoute';
import ProtectedRoute from './ProtectedRoute';
import './App.css';
import Home from './Home';

// Lazy load components
const Services = lazy(() => import('./Services'));
const AboutUs = lazy(() => import('./AboutUs'));
const AdminLayout = lazy(() => import('./AdminLayout'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const AdminServices = lazy(() => import('./AdminServices'));
const AdminServiceDetails = lazy(() => import('./AdminServiceDetails'));

const AdminProducts = lazy(() => import('./AdminProducts'));
const AdminProductDetails = lazy(() => import('./AdminProductDetails'));
const AdminProductDownload = lazy(() => import('./AdminProductDownload'));
const AdminCategories = lazy(() => import('./AdminCategories'));
const AdminDownloads = lazy(() => import('./AdminDownloads'));
const AdminServiceDownload = lazy(() => import('./AdminServiceDownload'));
const AdminRequests = lazy(() => import('./AdminRequests'));
const Contact = lazy(() => import('./Contact'));
const Download = lazy(() => import('./Download'));
const Products = lazy(() => import('./Products'));
const ProductDetails = lazy(() => import('./ProductDetails'));
const Login = lazy(() => import('./Login'));
const Register = lazy(() => import('./Register'));
const EditProfile = lazy(() => import('./EditProfile'));
const ServiceDetails = lazy(() => import('./ServiceDetails'));
const ForgotPassword = lazy(() => import('./ForgotPassword'));
const ResetPassword = lazy(() => import('./ResetPassword'));
const VerifyEmail = lazy(() => import('./VerifyEmail'));
const UserDashboard = lazy(() => import('./UserDashboard'));

const LoadingFallback = () => (
  <div className="loading-screen">
    <div className="loader"></div>
  </div>
);

const PublicLayout = () => (
  <>
    <Navbar />
    <Suspense fallback={<LoadingFallback />}>
      <Outlet />
    </Suspense>
    <Footer />
  </>
);

const App = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:productId" element={<ProductDetails />} />
            <Route path="/services" element={<Services />} />
            <Route path="/service/:serviceId" element={<ServiceDetails />} />

            <Route path="/about" element={<AboutUs />} />
            <Route path="/download" element={<Download />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            
            <Route element={<UserRoute />}>
              <Route path="/dashboard" element={<UserDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['Admin', 'User']} />}>
              <Route path="/edit-profile" element={<EditProfile />} />
            </Route>
          </Route>
          
          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="services/:serviceId/details" element={<AdminServiceDetails />} />
              <Route path="services/:serviceId/download" element={<AdminServiceDownload />} />

              <Route path="products" element={<AdminProducts />} />
              <Route path="products/:productId/details" element={<AdminProductDetails />} />
              <Route path="products/:productId/download" element={<AdminProductDownload />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="service-categories" element={<AdminCategories categoryType="Service" />} />
              <Route path="downloads" element={<AdminDownloads />} />
              <Route path="requests" element={<AdminRequests />} />
              <Route path="profile" element={<EditProfile />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;