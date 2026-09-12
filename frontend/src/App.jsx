import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import WhatsAppButton from './components/WhatsAppButton';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div className="min-h-screen transition-colors">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <WhatsAppButton />
    </div>
  );
}
