import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axiosClient from '../../axios';
import { useContracts } from './../../components/useContracts';
import { ethers } from 'ethers';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [email, setEmail] = useState(null);
    const navigate = useNavigate();
    const { connect, signer, productRegistry, escrow, logistics } = useContracts();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to view your orders');
            navigate('/login');
            return;
        }
        try {
            const decoded = jwtDecode(token);
            if (decoded.exp < Date.now() / 1000) throw new Error('expired');
            if (decoded.userType !== 'buyer') {
                alert('You must be a buyer to view this page');
                navigate('/');
                return;
            }
            setEmail(decoded.email);
        } catch {
            localStorage.removeItem('token');
            alert('Session expired—please log in again');
            navigate('/login');
        }
    }, []);

    useEffect(() => {
        if (!email) return;

        const fetchAndCombine = async () => {
            try {
                const resp = await axiosClient.get(
                    `/api/myOrders?email=${encodeURIComponent(email)}`
                );
                const userOrders = resp.data.userOrders;
                const combined = await Promise.all(
                    userOrders.map(async (order) => {
                        // on‑chain call
                        const raw = await productRegistry.getProduct(order.productId);
                        const product = {
                            id: raw[0].toString(),
                            address: raw[1],
                            email: raw[2],
                            name: raw[3],
                            description: raw[4],
                            productType: raw[5],
                            price: raw[6].toString(),
                            count: raw[7].toString(),
                            imageHashes: raw[8],
                            features: raw[9],
                        };
                        return {
                            orderId: order.orderId,
                            timestamp: order.timestamp,
                            status: order.orderStatus,
                            quantity: order.quantity,
                            destination: order.destination,
                            distance: order.distance,
                            distancePrice: order.distancePrice,
                            logisticsProviderEmail: order.logisticsProviderEmail,
                            product,
                        };
                    })
                );

                setOrders(combined);
            } catch (err) {
                console.error('Error fetching/combining orders:', err);
            }
        };

        fetchAndCombine();
    }, [email, productRegistry]);

    // 3) Mark as received (example)
    const handleReceived = async (order) => {
        if (!signer) {
            await connect();
        }
        const totalLogistics = BigInt(order.distance) * BigInt(order.distancePrice) / BigInt(2);
        const logisticsFee = ethers.parseUnits(`${totalLogistics}`, 'gwei');
        try {
            const txn = await escrow.connect(signer).confirmDelivery(order.orderId, logisticsFee)
            const receipt = await txn.wait();
            console.log("✅ confirmDelivery receipt", receipt);
            alert("Product received!");
            handleStatusChange(order.orderId, 'delivered');
        } catch (error) {
            console.error("Error confirming delivery:", error);
            alert("Transaction failed");
        }
    };

    const handleDepositAmount = async (order) => {
        if (!signer) {
            await connect();
        }
        let logisticsWalletAddress;
        try {
            logisticsWalletAddress = await logistics.getProviderAddress(order.logisticsProviderEmail);
        } catch (e) {
            console.error("couldn't fetch logistics address", e);
            return;
        }
        const totalLogistics = BigInt(order.distance) * BigInt(order.distancePrice) / BigInt(2);
        const productCost = BigInt(order.product.price) * BigInt(order.quantity);
        const totalCostGwei = (totalLogistics + productCost).toString();
        const value = ethers.parseUnits(totalCostGwei, 'gwei');
        try {
            const tx = await escrow.connect(signer).depositPayment(
                order.orderId,
                order.product.address,
                logisticsWalletAddress,
                ethers.parseUnits(totalCostGwei, 'gwei'),
                { value }
            );
            const receipt = await tx.wait();
            console.log("✅ depositPayment receipt", receipt);
            alert("Payment deposited!");
        } catch (err) {
            console.error("depositPayment failed", err);
            alert("Transaction failed");
        }
    };
    const handleStatusChange = async (orderId, newStatus) => {
        const updateStatus = await axiosClient.put(`/api/updateOrderStatus/${orderId}`, { orderStatus: newStatus.toLowerCase() });
        if (updateStatus.status === 200) {
            console.log('Order status updated:', newStatus);
            setOrders((os) =>
                os.map((o) =>
                    o.orderId === orderId
                        ? { ...o, status: newStatus.toLowerCase() }
                        : o
                )
            );
        } else {
            console.error('Error updating order status:', updateStatus);
        }
    }

    const handleCancel = async (order) => {
        if (confirm("Are you sure you want to cancel this order?")) {
            if (!signer) {
                await connect();
            }
            try {
                const tx = await escrow.connect(signer).cancelOrder(order.orderId);
                const receipt = await tx.wait();
                console.log("✅ Order Canceled", receipt);
                alert("Payment deposited!");
                handleStatusChange(order.orderId, 'shipped');
            } catch (err) {
                console.log("depositPayment failed", err);
            }
        }
    }
    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-4xl font-extrabold text-center text-white mb-10">
                My Orders
            </h1>

            {orders.length === 0 ? (
                <p className="text-center text-white text-xl">
                    You have no orders yet.
                </p>
            ) : (
                orders.map((o) => (
                    <div
                        key={o.orderId}
                        className="mb-8 rounded-xl border border-gray-700 bg-gray-900 shadow-lg hover:shadow-xl transition-shadow duration-300"
                    >
                        {/* Order header */}
                        <div className="p-6 border-b border-gray-700 flex flex-col md:flex-row md:justify-between md:items-center">
                            <div>
                                <p className="text-white text-xl font-bold">
                                    Order ID: {o.orderId}
                                </p>
                                <p className="text-sm text-gray-400">
                                    Placed on: {new Date(o.orderId).toLocaleDateString()}
                                </p>
                            </div>
                            <span
                                className={`px-4 py-1 rounded-full text-sm font-semibold ${o.status === 'delivered'
                                    ? 'bg-green-700 text-green-200'
                                    : 'bg-yellow-700 text-yellow-200'
                                    }`}
                            >
                                {o.status}
                            </span>
                        </div>

                        {/* Product + order info */}
                        <div className="p-6 flex flex-col md:flex-row">
                            <div className="w-full md:w-40 flex justify-center md:justify-start mb-4 md:mb-0">
                                <img
                                    src={`https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${o.product.imageHashes[0]}`}
                                    alt={o.product.name}
                                    className="rounded-lg w-[150px] h-[150px] object-cover border"
                                />
                            </div>
                            <div className="md:ml-6 flex-1 space-y-2">
                                <h2 className="text-xl text-white font-bold">
                                    {o.product.name}
                                </h2>
                                <p className="text-gray-300">
                                    Quantity ordered: {o.quantity}
                                </p>
                                <p className="text-white font-semibold text-lg">
                                    Product price: {o.product.price}gwei
                                </p>
                                <p className="text-gray-400">
                                    Destination: {o.destination}
                                </p>
                                <p className="text-gray-400">
                                    Shipping distance: {o.distance} km
                                </p>
                                <p className="text-gray-400">
                                    distance Price of Logistics : {o.distancePrice ? `${o.distancePrice} gwei/km` : "No details"}
                                </p>
                                <p className="text-gray-400">
                                    Total Price : {o.distancePrice ? `${o.distancePrice * o.distance / 2 + o.product.price * o.quantity} ` : "No details"} i.e. product price + half logistics price
                                </p>

                                {(o.status === 'accepted') ?
                                    <button onClick={() => { handleDepositAmount(o) }} className='mt-4 mx-2 px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md font-medium transition-all'>
                                        Deposit Payment
                                    </button> : <></>}
                                {(o.status === 'shipped') ? (
                                    <>
                                        <button
                                            className="mt-4 mx-2 px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md font-medium transition-all"
                                            onClick={() => handleReceived(o)}
                                        >
                                            Confirm Delivery
                                        </button>
                                        <button className="mt-4 mx-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-all" onClick={() => handleCancel(o)}>
                                            Cancel Order
                                        </button>
                                    </>
                                ) : (
                                    <></>
                                )}
                                {(o.status === 'delivered') ? (
                                    <div className="mt-4 text-green-400 font-bold flex items-center">
                                        ✔ Product Received
                                    </div>
                                ) : (
                                    <></>
                                )
                                }
                                {(o.status === 'cancelled') ? (<div className="mt-4 text-red-400 font-bold flex items-center">
                                    ❌ Order Cancelled
                                </div>) : (<></>)}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
