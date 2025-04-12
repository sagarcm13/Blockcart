import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getLogisticsProviders, assignLogistics } from '../../../api';

const AssignLogistics = () => {
  const [selectedOrder, setSelectedOrder] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const queryClient = useQueryClient();

  const { data: providers, isLoading: providersLoading } = useQuery(
    'logisticsProviders',
    getLogisticsProviders
  );

  const assignLogisticsMutation = useMutation(assignLogistics, {
    onSuccess: () => {
      queryClient.invalidateQueries('sellerOrders');
      setSelectedOrder('');
      setSelectedProvider('');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedOrder && selectedProvider) {
      assignLogisticsMutation.mutate({
        orderId: selectedOrder,
        providerId: selectedProvider
      });
    }
  };

  if (providersLoading) {
    return <div className="text-center">Loading logistics providers...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Assign Logistics Provider</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Order ID</label>
          <input
            type="text"
            value={selectedOrder}
            onChange={e => setSelectedOrder(e.target.value)}
            className="w-full bg-gray-700 rounded p-2"
            placeholder="Enter Order ID"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Select Logistics Provider</label>
          <select
            value={selectedProvider}
            onChange={e => setSelectedProvider(e.target.value)}
            className="w-full bg-gray-700 rounded p-2"
            required
          >
            <option value="">Select a provider</option>
            {providers?.map(provider => (
              <option key={provider.id} value={provider.id}>
                {provider.name} - ${provider.pricePerKm}/km
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          disabled={assignLogisticsMutation.isLoading}
        >
          {assignLogisticsMutation.isLoading ? 'Assigning...' : 'Assign Logistics Provider'}
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Available Logistics Providers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers?.map(provider => (
            <div key={provider.id} className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold">{provider.name}</h4>
              <p className="text-gray-400">Price per km: ${provider.pricePerKm}</p>
              <p className="text-gray-400">Wallet: {provider.walletAddress}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssignLogistics; 