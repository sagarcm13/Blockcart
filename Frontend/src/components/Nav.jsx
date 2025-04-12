import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import UserMenu from './UserMenu';

// eslint-disable-next-line react/prop-types
export default function Nav({ isAuthenticated, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{

  },[isAuthenticated])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
    navigate('/');
  };

  return (
    <nav className="bg-gray-900 text-white p-4 top-0 z-10 sticky left-0 w-full">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <Link to="/">Blockcart</Link>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search..."
            className="px-3 py-2 rounded-lg text-gray-700 focus:outline-none"
          />
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
            Search
          </button>
        </div>

        {/* Links */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-gray-400">Home</Link>
          <Link to="/seller" className="hover:text-gray-400">Become a Seller</Link>
          <Link to="/seller/dashboard" className="hover:text-gray-400">Seller Dashboard</Link>
          <Link to="/logistics/dashboard" className="hover:text-gray-400">Logistics Dashboard</Link>
        </div>

        {/* Cart & User Menu */}
        <div className="flex space-x-6 items-center">
          <Link to="/cart" className="hover:text-gray-400">
            <i className="fas fa-shopping-cart"></i> Cart
          </Link>
          <UserMenu isAuthenticated={isAuthenticated} onLogout={onLogout} />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            id="mobile-menu-button"
            className="text-white focus:outline-none"
            onClick={toggleMobileMenu}
          >
            <img src="https://cdn-icons-png.flaticon.com/512/9451/9451364.png" height={50} width={50} alt="Menu" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`md:hidden absolute top-full left-0 w-full bg-gray-900 text-white p-4 transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'block' : 'hidden'
        }`}
      >
        <Link to="/" className="hover:text-gray-400 block mb-4">Home</Link>
        <Link to="/seller" className="hover:text-gray-400 block mb-4">Become a Seller</Link>
        <Link to="/seller/dashboard" className="hover:text-gray-400 block mb-4">Seller Dashboard</Link>
        <Link to="/logistics/dashboard" className="hover:text-gray-400 block mb-4">Logistics Dashboard</Link>
        <Link to="/cart" className="hover:text-gray-400 block mb-4">Cart</Link>
        {isAuthenticated ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <FaUser className="mr-2" />
              User
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center hover:text-gray-400"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Link to="/login" className="block hover:text-gray-400">Login</Link>
            <Link to="/sign_up" className="block hover:text-gray-400">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}