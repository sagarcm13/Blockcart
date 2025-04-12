import { useState } from 'react';

// Dummy assigned orders data
const dummyAssignedOrders = [
  {
    id: 1,
    orderId: "ORD001",
    customerName: "John Doe",
    pickupAddress: "123 Main St, City",
    deliveryAddress: "456 Oak Ave, Town",
    distance: "25 km",
    status: "Pending",
    payment: "Pending"
  },
  {
    id: 2,
    orderId: "ORD002",
    customerName: "Jane Smith",
    pickupAddress: "789 Pine Rd, Village",
    deliveryAddress: "321 Elm St, City",
    distance: "15 km",
    status: "In Transit",
    payment: "Completed"
  }
];

const LogisticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('register');
  const [providerForm, setProviderForm] = useState({
    email: '',
    distancePrice: '',
    walletAddress: ''
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Provider registration:', providerForm);
    // Reset form
    setProviderForm({
      email: '',
      distancePrice: '',
      walletAddress: ''
    });
  };

  return (
    <div className="min-h-screen bg-[#18181b] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Logistics Provider Dashboard</h1>
        
        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('register')}
            className={`pb-4 px-4 ${
              activeTab === 'register'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Become a Provider
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-4 ${
              activeTab === 'orders'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Assigned Orders
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {/* Register Form Tab */}
          {activeTab === 'register' && (
            <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={providerForm.email}
                  onChange={e => setProviderForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-gray-700 rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price per Kilometer ($)</label>
                <input
                  type="number"
                  value={providerForm.distancePrice}
                  onChange={e => setProviderForm(prev => ({ ...prev, distancePrice: e.target.value }))}
                  className="w-full bg-gray-700 rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Wallet Address</label>
                <input
                  type="text"
                  value={providerForm.walletAddress}
                  onChange={e => setProviderForm(prev => ({ ...prev, walletAddress: e.target.value }))}
                  className="w-full bg-gray-700 rounded p-2"
                  placeholder="Enter your wallet address"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Register as Provider
              </button>
            </form>
          )}

          {/* Assigned Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {dummyAssignedOrders.map(order => (
                <div key={order.id} className="bg-gray-800 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Order #{order.orderId}</h3>
                      <p className="text-gray-400">Customer: {order.customerName}</p>
                      <p className="text-gray-400">Status: {order.status}</p>
                      <p className="text-gray-400">Payment: {order.payment}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Delivery Details</h4>
                      <p className="text-gray-400">Pickup: {order.pickupAddress}</p>
                      <p className="text-gray-400">Delivery: {order.deliveryAddress}</p>
                      <p className="text-gray-400">Distance: {order.distance}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-4">
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      onClick={() => console.log('Update status for order:', order.id)}
                    >
                      Update Status
                    </button>
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      onClick={() => console.log('View details for order:', order.id)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogisticsDashboard; 