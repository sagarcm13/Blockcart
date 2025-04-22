import { NavLink, Outlet } from 'react-router-dom';

const SellerDashboard = () => {

  return (
    <div className="min-h-screen bg-[#18181b] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Seller Dashboard</h1>
        <nav className="flex space-x-4 mb-8 border-b border-gray-700">
          <NavLink to="products" className={({ isActive }) =>
            `pb-4 px-4 ${isActive ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'}`
          }>
            My Products
          </NavLink>
          <NavLink to="add" className={({ isActive }) =>
            `pb-4 px-4 ${isActive ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'}`
          }>
            Add Product
          </NavLink>
          <NavLink to="orders" className={({ isActive }) =>
            `pb-4 px-4 ${isActive ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'}`
          }>
            Orders
          </NavLink>
        </nav>
        <Outlet />
      </div>
    </div>
  );
};

export default SellerDashboard;
