import { useState, useEffect } from 'react';
import { useContracts } from '../../components/useContracts';
import axiosClient from '../../axios';

export default function Orders() {
    const [showProvidersModal, setShowProvidersModal] = useState(false);
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [availableProviders, setAvailableProviders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [assignForm, setAssignForm] = useState({
        distancePrice: '',
        providerEmail: '',
        userLocation: '',
        distance: '',
        orderStatus: 'accepted',
        orderId: '',
    });
    const { connect, signer, logistics, productRegistry } = useContracts();
    const [productIds, setProductIds] = useState([]);
    const [myProducts, setMyProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [orderedDetails, setOrderedDetails] = useState([]);

    // connect wallet
    useEffect(() => {
        connect().catch(console.error);
    }, [connect]);

    // fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const products = await productRegistry.getMyProducts();
                const formatted = products.map(p => ({
                    id: p[0].toString(),
                    address: p[1],
                    email: p[2],
                    name: p[3],
                    description: p[4],
                    productType: p[5],
                    price: p[6].toString(),
                    count: p[7].toString(),
                    imageHashes: p[8],
                    features: p[9],
                }));
                setMyProducts(formatted);
                const ids = formatted.map(p => p.id);
                setProductIds(prev => (
                    prev.length === ids.length && prev.every((v, i) => v === ids[i])
                        ? prev
                        : ids
                ));
            } catch (err) {
                console.error(err);
            }
        };
        fetchProducts();
    }, [signer, productRegistry]);

    // fetch orders
    const fetchOrders = async () => {
        try {
            const res = await axiosClient.post('/api/orderedProductsByIds', { productIds });
            setOrders(res.data.existingOrders || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    };
    useEffect(() => {
        if (productIds.length) fetchOrders();
    }, [productIds]);

    // merge details
    useEffect(() => {
        if (!orders.length || !myProducts.length) {
            setOrderedDetails([]);
            return;
        }
        const map = myProducts.reduce((m, p) => ({ ...m, [p.id]: p }), {});
        const merged = orders.map(ord => {
            const id = ord.productId?.toString() ?? ord.product?.id?.toString();
            return { ...ord, product: map[id] || null };
        });
        setOrderedDetails(merged);
    }, [orders, myProducts]);

    // when "Assign Logistics" is clicked, fetch providers
    const handleAssignLogistics = async (order) => {
        setSelectedOrder(order);
        try {
            const providers = await logistics.getProvidersByMaxDistancePrice(20);
            const formatted = providers.map(p => ({
                email: p[0],
                distancePrice: p[1].toString(),
                wallet: p[2],
            }));
            setAvailableProviders(formatted);
            setShowProvidersModal(true);
        } catch (e) {
            console.error('Error fetching providers:', e);
        }
    };

    // when a provider is selected from the list
    const handleSelectProvider = (provider) => {
        setShowProvidersModal(false);
        setAssignForm({
            distancePrice: provider.distancePrice,
            providerEmail: provider.email,
            userLocation: selectedOrder.destination || selectedOrder.email,
            distance: '',
            orderStatus: 'accepted',
            orderId: selectedOrder.orderId,
            pickup: '',
        });
        fetchOrders();
        setShowAssignForm(true);
    };

    // form input changes
    const onFormChange = (e) => {
        const { name, value } = e.target;
        if (name === 'distance') {
            const distance = parseFloat(value);
            setAssignForm(prev => ({ ...prev, [name]: value, distance }));
        } else {
            setAssignForm(prev => ({ ...prev, [name]: value }));
        }
    };

    // submit assignment
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            updatedAmount: selectedOrder.product.price * selectedOrder.quantity + assignForm.distance * assignForm.distancePrice,
            distance: assignForm.distance,
            distancePrice: assignForm.distancePrice,
            orderStatus: assignForm.orderStatus,
            logisticsProviderEmail: assignForm.providerEmail,
            pickup: assignForm.pickup,
        };
        console.log('Submitting logistics assignment:', payload);
        try {
            const response = await axiosClient.put(`/api/orders/${selectedOrder.orderId}`, payload);
            if (response.status === 200) {
                console.log('Logistics assignment submitted successfully:', response.data);
                alert('Logistics assignment submitted successfully');
            } else {
                console.error('Error submitting logistics assignment:', response.data);
                alert('Error submitting logistics assignment');
            }
        } catch (error) {
            console.error('Error submitting logistics assignment:', error);
        }
        setShowAssignForm(false);
        setSelectedOrder(null);
    };

    return (
        <div className="space-y-6">
            {orderedDetails.map(order => (
                <div key={order.orderId} className="bg-gray-800 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Order #{order.orderId}</h3>
                            <p className="text-gray-400">Customer: {order.email}</p>
                            <p className="text-gray-400">Status: {order.orderStatus}</p>
                            <p className="text-gray-400">Logistics assigned: {order.logisticsProviderEmail ? order.logisticsProviderEmail : "not assigned"}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Product Details</h4>
                            <p className="text-gray-400">{order.product.name}</p>
                            <p className="text-gray-400">Quantity: {order.quantity}</p>
                            <p className="text-gray-400">Price: {order.product.price} gwei</p>
                        </div>
                    </div>
                    {
                        order.logisticsProviderEmail ?
                            <>
                            </>
                            : <button
                                onClick={() => handleAssignLogistics(order)}
                                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Assign Logistics
                            </button>
                    }
                </div>
            ))}

            {/* Providers List Modal */}
            {showProvidersModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
                        <h2 className="text-2xl font-bold mb-4">Select Logistics Provider</h2>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto">
                            {availableProviders.map((prov, i) => (
                                <div key={i} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold">{prov.email}</h3>
                                        <p className="text-gray-400">Price per km: {prov.distancePrice}</p>
                                        <p className="text-gray-400">Wallet: {prov.wallet}</p>
                                    </div>
                                    <button
                                        onClick={() => handleSelectProvider(prov)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        Select
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowProvidersModal(false)}
                            className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Assign Logistics Form Modal */}
            {showAssignForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Logistics Assignment</h2>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-300">Distance Price (per km)</label>
                                <input
                                    type="text"
                                    name="distancePrice"
                                    value={assignForm.distancePrice}
                                    readOnly
                                    className="mt-1 w-full bg-gray-700 text-white rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300">User Location</label>
                                <input
                                    type="text"
                                    name="userLocation"
                                    value={assignForm.userLocation}
                                    readOnly
                                    className="mt-1 w-full bg-gray-700 text-white rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300">Pick Up Location</label>
                                <input
                                    type="text"
                                    name="pickup"
                                    value={assignForm.pickup}
                                    onChange={onFormChange}
                                    className="mt-1 w-full bg-gray-700 text-white rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300">Distance (km) from seller to buyer location</label>
                                <input
                                    type="number"
                                    name="distance"
                                    value={assignForm.distance}
                                    onChange={onFormChange}
                                    required
                                    className="mt-1 w-full bg-gray-700 text-white rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300">Logistics Email</label>
                                <input
                                    type="text"
                                    name="providerEmail"
                                    value={assignForm.providerEmail}
                                    readOnly
                                    className="mt-1 w-full bg-gray-700 text-white rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300">Order Status</label>
                                <select
                                    name="orderStatus"
                                    value={assignForm.orderStatus}
                                    onChange={onFormChange}
                                    className="mt-1 w-full bg-gray-700 text-white rounded p-2"
                                >
                                    <option value="accepted">accepted</option>
                                    <option value="pending">pending</option>
                                    <option value="shipped">shipped</option>
                                    <option value="delivered">delivered</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAssignForm(false)}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
