import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Notification from './components/Notification';
import Nav from './components/Nav.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import Home from './pages/home/Home.jsx';
import List from './pages/list/List.jsx';
import Cart from './pages/cart/Cart.jsx';
import Checkout from './pages/cart/Checkout.jsx';
import MyOrders from './pages/cart/MyOrders.jsx';
import Product from './pages/product/Product.jsx';
import Footer from './components/Footer.jsx';
import Login from './pages/auth/Login.jsx';
import SignUp from './pages/auth/SignUp.jsx';
import SellerDashboard from './pages/seller/SellerDashboard.jsx';
import MyProducts from './pages/seller/MyProducts.jsx';
import AddProduct from './pages/seller/AddProduct.jsx';
import Orders from './pages/seller/Orders.jsx';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import BecomeProvider from './pages/logistics/BecomeProvider.jsx';
import Logistics from './pages/logistics/Logistics.jsx';
import AssignedOrders from './pages/logistics/AssignedOrders.jsx';

const queryClient = new QueryClient();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Notification />
        <div className="flex flex-col min-h-screen">
          <Nav isAuthenticated={isAuthenticated} onLogout={handleLogout} />
          <ScrollToTop />
          <main className="flex-grow bg-[#18181b]">
            <Routes>
              <Route index element={<Home />} />
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/sign_up" element={<SignUp onLogin={handleLogin} />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/list" element={<List />} />
              <Route path="/product" element={<Product />} />

              <Route path="/seller" element={<SellerDashboard />}>
                <Route index element={<Navigate to="products" replace />} />
                <Route path="products" element={<MyProducts />} />
                <Route path="add" element={<AddProduct />} />
                <Route path="orders" element={<Orders />} />
              </Route>
              <Route path="/logistics" element={<Logistics />} >
                <Route index element={<Navigate to="become-provider" replace />} />
                <Route path="become-provider" element={<BecomeProvider />} />
                <Route path="assigned-Orders" element={<AssignedOrders />} />
              </Route>
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </QueryClientProvider >
  );
}

export default App;
