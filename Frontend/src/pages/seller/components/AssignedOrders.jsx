import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { updateOrderStatus } from '../../../api';

const AssignedOrders = ({ orders, isLoading }) => {
  const [selectedStatus, setSelectedStatus] = useState({});
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation(updateOrderStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries('sellerOrders');
    }
  });

  const handleStatusChange = (orderId, status) => {
    setSelectedStatus(prev => ({ ...prev, [orderId]: status }));
    updateStatusMutation.mutate({ orderId, status });
  };

  if (isLoading) {
    return <div className="text-center">Loading orders...</div>;
  }

  if (!orders?.length) {
    return <div className="text-center">No orders found.</div>;
  }

  return (
    <div className="space-y-6">
      {orders.map(order => (
        <div key={order.id} className="bg-gray-800 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Order #{order.id}</h3>
              <p className="text-gray-400">Customer: {order.customerName}</p>
              <p className="text-gray-400">Phone: {order.customerPhone}</p>
              <p className="text-gray-400">Address: {order.shippingAddress}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Products</h4>
              <ul className="space-y-2">
                {order.products.map(product => (
                  <li key={product.id} className="flex justify-between">
                    <span>{product.name}</span>
                    <span>${product.price} x {product.quantity}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <p className="font-semibold">Total: ${order.total}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Order Status</label>
            <select
              value={selectedStatus[order.id] || order.status}
              onChange={e => handleStatusChange(order.id, e.target.value)}
              className="w-full bg-gray-700 rounded p-2"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssignedOrders; 