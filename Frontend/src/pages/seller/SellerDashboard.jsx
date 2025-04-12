import { useState } from 'react';

// Dummy products data
const dummyProducts = [
  {
    id: 1,
    name: "Smartphone X",
    description: "Latest smartphone with advanced features",
    price: 999.99,
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
    ]
  },
  {
    id: 2,
    name: "Laptop Pro",
    description: "High-performance laptop for professionals",
    price: 1499.99,
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853"
    ]
  },
  {
    id: 3,
    name: "Wireless Headphones",
    description: "Premium noise-cancelling wireless headphones",
    price: 299.99,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
    ]
  },
  {
    id: 4,
    name: "Smart Watch",
    description: "Feature-rich smartwatch with health tracking",
    price: 399.99,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30"
    ]
  }
];

// Dummy orders data
const dummyOrders = [
  {
    id: 1,
    product: dummyProducts[0],
    customerName: "John Doe",
    status: "Pending",
    quantity: 1
  },
  {
    id: 2,
    product: dummyProducts[1],
    customerName: "Jane Smith",
    status: "Processing",
    quantity: 2
  }
];

// Dummy logistics providers
const dummyLogistics = [
  {
    id: 1,
    name: "Fast Delivery Express",
    pricePerKm: 2.5,
    rating: 4.8,
    deliveryTime: "1-2 days"
  },
  {
    id: 2,
    name: "Quick Ship Logistics",
    pricePerKm: 3.0,
    rating: 4.5,
    deliveryTime: "2-3 days"
  },
  {
    id: 3,
    name: "Premium Courier",
    pricePerKm: 4.0,
    rating: 4.9,
    deliveryTime: "1 day"
  }
];

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    features: ['', '', '', ''],
    images: []
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showLogisticsModal, setShowLogisticsModal] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    setNewProduct(prev => ({ ...prev, images: files }));
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...newProduct.features];
    newFeatures[index] = value;
    setNewProduct(prev => ({ ...prev, features: newFeatures }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('New product:', newProduct);
    // Reset form
    setNewProduct({ 
      name: '', 
      description: '', 
      price: '', 
      features: ['', '', '', ''],
      images: [] 
    });
    setImagePreviews([]);
    setActiveTab('products');
  };

  const handleAssignLogistics = (orderId) => {
    setSelectedOrder(orderId);
    setShowLogisticsModal(true);
  };

  const handleSelectLogistics = (logisticsId) => {
    // Here you would typically handle logistics assignment
    console.log('Assigning logistics', logisticsId, 'to order', selectedOrder);
    setShowLogisticsModal(false);
    setSelectedOrder(null);
  };

  return (
    <div className="min-h-screen bg-[#18181b] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Seller Dashboard</h1>
        
        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-4 px-4 ${
              activeTab === 'products'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            My Products
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`pb-4 px-4 ${
              activeTab === 'add'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Add New Product
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-4 ${
              activeTab === 'orders'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Orders
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {/* My Products Tab */}
          {activeTab === 'products' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dummyProducts.map(product => (
                <div key={product.id} className="bg-gray-800 rounded-lg p-6">
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-400 mb-4">{product.description}</p>
                  <p className="text-2xl font-bold">${product.price}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add New Product Tab */}
          {activeTab === 'add' && (
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-gray-700 rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={e => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-gray-700 rounded p-2"
                  rows="4"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={e => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full bg-gray-700 rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Features</label>
                {[0, 1, 2, 3].map(index => (
                  <input
                    key={index}
                    type="text"
                    value={newProduct.features[index]}
                    onChange={e => handleFeatureChange(index, e.target.value)}
                    className="w-full bg-gray-700 rounded p-2 mb-2"
                    placeholder={`Feature ${index + 1}`}
                    required
                  />
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Product Images (4 images required)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full bg-gray-700 rounded p-2"
                  required
                />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <img
                      key={index}
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Add Product
              </button>
            </form>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {dummyOrders.map(order => (
                <div key={order.id} className="bg-gray-800 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Order #{order.id}</h3>
                      <p className="text-gray-400">Customer: {order.customerName}</p>
                      <p className="text-gray-400">Status: {order.status}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Product Details</h4>
                      <p className="text-gray-400">{order.product.name}</p>
                      <p className="text-gray-400">Quantity: {order.quantity}</p>
                      <p className="text-gray-400">Price: ${order.product.price}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAssignLogistics(order.id)}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Assign Logistics
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Logistics Modal */}
      {showLogisticsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">Select Logistics Provider</h2>
            <div className="space-y-4">
              {dummyLogistics.map(logistics => (
                <div key={logistics.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{logistics.name}</h3>
                      <p className="text-gray-400">Price per km: ${logistics.pricePerKm}</p>
                      <p className="text-gray-400">Delivery Time: {logistics.deliveryTime}</p>
                      <p className="text-gray-400">Rating: {logistics.rating} ⭐</p>
                    </div>
                    <button
                      onClick={() => handleSelectLogistics(logistics.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowLogisticsModal(false)}
              className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard; 