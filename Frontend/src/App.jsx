import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Notification from './components/Notification';
import Nav from './components/Nav.jsx';
import Home from './pages/home/Home.jsx';
import List from './pages/list/List.jsx';
import Cart from './pages/cart/Cart.jsx';
import Product from './pages/product/Product.jsx';
import Footer from './components/Footer.jsx';
import Login from './pages/auth/Login.jsx';
import SignUp from './pages/auth/SignUp.jsx';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const queryClient = new QueryClient();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('token')?true:false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Notification />
        <div className="flex flex-col min-h-screen">
          <Nav isAuthenticated={isAuthenticated} onLogout={handleLogout} />
          <main className="flex-grow bg-[#18181b]">
            <Routes>
              <Route index element={<Home />} />
              <Route path='/' element={<Home />} />
              <Route path='/login' element={<Login onLogin={handleLogin} />} />
              <Route path='/sign_up' element={<SignUp onLogin={handleLogin}/>} />
              <Route path='/cart' element={<Cart />} />
              <Route path='/list' element={<List />} />
              <Route path='/product' element={<Product />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
