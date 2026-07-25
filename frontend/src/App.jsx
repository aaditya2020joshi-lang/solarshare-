import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import MyListings from './pages/MyListings';
import SellerRequests from './pages/SellerRequests';
import MyRequests from './pages/MyRequests';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Learn from './pages/Learn';
import Panels from './pages/Panels';
import PanelDetail from './pages/PanelDetail';
import Checkout from './pages/Checkout';
import MyPanelOrders from './pages/MyPanelOrders';
import WhatsAppButton from './components/WhatsAppButton';
import FaqChatWidget from './components/FaqChatWidget';
import AdSenseLoader from './components/AdSenseLoader';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <AdSenseLoader />
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/panels" element={<Panels />} />
        <Route path="/panels/:id" element={<PanelDetail />} />
        <Route
          path="/checkout/:id"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyPanelOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/listings"
          element={
            <ProtectedRoute role="seller">
              <MyListings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/listings/new"
          element={
            <ProtectedRoute role="seller">
              <CreateListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/requests"
          element={
            <ProtectedRoute role="seller">
              <SellerRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer/requests"
          element={
            <ProtectedRoute role="buyer">
              <MyRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
      <FaqChatWidget />
      <WhatsAppButton />
    </div>
  );
}
