import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode';
import axiosClient from '../../axios';
import { useNavigate } from 'react-router-dom';
export default function AssignedOrders() {
    const [assignedOrders, setAssignedOrders] = useState([]);
    const [logisticsEmail, setEmail] = useState(null);
    const navigate = useNavigate();
    const statusOptions = ['Accepted', 'Shipped', 'Cancelled'];

    const handleStatusChange = async (orderId, newStatus) => {
        const updateStatus = await axiosClient.put(`/api/updateOrderStatus/${orderId}`, { orderStatus: newStatus.toLowerCase() });
        if (updateStatus.status === 200) {
            fetchAssignedOrders();
            console.log('Order status updated:', newStatus);
        } else {
            console.error('Error updating order status:', updateStatus);
        }
    }
    const fetchAssignedOrders = async () => {
        const orders = await axiosClient.get('/api/assignedOrders?logisticsProviderEmail=' + logisticsEmail);
        if (orders.status === 200) {
            setAssignedOrders(orders.data.orders);
            console.log('Assigned orders:', orders.data.orders);
        } else {
            console.error('Error fetching assigned orders:', orders);
        }
    }
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                if (decodedToken.exp && decodedToken.exp < currentTime) {
                    localStorage.removeItem('token');
                    alert('Please login again session expired');
                    navigate('/login');
                    return;
                }
                if (decodedToken.userType !== 'logistics') {
                    alert('You are not logistics provider to view this page login with logistics account to add product');
                    navigate('/login');
                    return;
                }
                setEmail(decodedToken.email);
            } catch (e) {
                console.error('Invalid token', e);
                alert('Please login again session expired');
                navigate('/login');
                localStorage.removeItem('token');
            }
        } else {
            alert('Please login with logistics account to view your orders');
            navigate('/login');
        }
        if (logisticsEmail) {
            fetchAssignedOrders();
        }
    }, [logisticsEmail]);
    return (
        <>
            <div className="space-y-6">
                {assignedOrders.map(order => (
                    <div key={order.orderId} className="bg-gray-800 rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Order #{order.orderId}</h3>
                                <p className="text-gray-400">Customer: {order.email}</p>
                                <p className="text-gray-400">Status: {order.orderStatus}</p>
                                <p className="text-gray-400">Payment: {order.updatedAmount}gwei</p>
                                <p className="text-gray-400">Pick Up: {order.pickup ? order.pickup : ""}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Delivery Details</h4>
                                <p className="text-gray-400">destination: {order.destination}</p>
                                <p className="text-gray-400">Order Placed: {new Date(`${order.createdAt}`)
                                    .toLocaleDateString('en-IN', { dateStyle: 'medium', timeZone: 'Asia/Kolkata' })}</p>
                                <p className="text-gray-400">Distance: {order.distance}</p>
                                <p className="text-gray-400">Distance Price: {order.distancePrice}</p>
                            </div>
                        </div>
                        <div className="mt-4 flex space-x-4">
                            {order.orderStatus !== 'delivered' &&
                                <select
                                    defaultValue={order.orderStatus[0].toUpperCase() + order.orderStatus.slice(1)}
                                    className="bg-gray-700 text-white px-3 py-2 rounded"
                                    onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                                >
                                    {statusOptions.map((status, idx) => (
                                        <option key={idx} value={status}>{status}</option>
                                    ))}
                                </select>
                            }
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
