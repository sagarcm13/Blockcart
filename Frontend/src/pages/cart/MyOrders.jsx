import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axiosClient from '../../axios';
import { useContracts } from './../../components/useContracts';
import { ethers } from 'ethers';
import { jsPDF } from 'jspdf';

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
                        paymentStatus: order.paymentStatus,
                        product,
                    };
                })
            );
            setOrders(combined);
        } catch (err) {
            console.error('Error fetching/combining orders:', err);
        }
    };
    useEffect(() => {
        if (!email) return;

        fetchAndCombine();
    }, [email]);

    const setPaymentStatus = async (orderId, status) => {
        const updateStatus = await axiosClient.put(`/api/updatePaymentStatus/${orderId}`, { paymentStatus: status });
        if (updateStatus.status === 200) {
            console.log('Order status updated:', status);
        } else {
            console.error('Error updating order status:', updateStatus);
        }
    }

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
            await handleStatusChange(order.orderId, 'delivered');
            await fetchAndCombine();
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
            await setPaymentStatus(order.orderId, true);
            await fetchAndCombine();
        } catch (err) {
            console.error("depositPayment failed", err);
            alert("Transaction failed");
        }
    };
    const handleStatusChange = async (orderId, newStatus) => {
        const updateStatus = await axiosClient.put(`/api/updateOrderStatus/${orderId}`, { orderStatus: newStatus.toLowerCase() });
        if (updateStatus.status === 200) {
            console.log('Order status updated:', newStatus);
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
                handleStatusChange(order.orderId, 'cancelled');
                fetchAndCombine();
            } catch (err) {
                console.log("depositPayment failed", err);
            }
        }
    }

    function handleGenerateInvoice(order) {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        let y = 40;
        const lineHeight = 14;

        // ── Company Header
        doc.setFont('helvetica', 'bold').setFontSize(20);
        doc.text("Blockcart", 40, y);
        doc.setFont('helvetica', 'normal').setFontSize(12);
        doc.text("A decentralized E-Commerce", 40, y + 20);

        // ── Invoice Title & Metadata
        doc.setFont('helvetica', 'bold').setFontSize(16);
        doc.text("INVOICE", 550, y, { align: 'right' });
        doc.setFont('helvetica', 'normal').setFontSize(10);
        doc.text(`Invoice #: ${order.orderId}`, 550, y + 20, { align: 'right' });
        doc.text(
            `Date: ${new Date(order.orderId).toLocaleDateString()}`,
            550,
            y + 35,
            { align: 'right' }
        );

        // ── Divider
        doc.setLineWidth(0.5).line(40, y + 50, 555, y + 50);
        y += 80;

        // ── Bill To
        doc.setFont('helvetica', 'bold').setFontSize(12).text("Bill To:", 40, y);
        doc.setFont('helvetica', 'normal').text(email || "—", 100, y);
        y += 30;

        // ── Table Header
        doc.setFont('helvetica', 'bold').setFontSize(12);
        doc.text("Description", 40, y);
        doc.text("Qty", 300, y, { align: 'right' });
        doc.text("Unit Price", 380, y, { align: 'right' });
        doc.text("Total", 550, y, { align: 'right' });
        y += 8;
        doc.setLineWidth(0.3).line(40, y, 555, y);
        y += 20;

        // ── Line Item: Product (with wrapping)
        const productTotal = Number(order.product.price) * order.quantity;
        const descColWidth = 150;
        doc.setFont('helvetica', 'normal').setFontSize(12);

        // wrap long product names
        const nameLines = doc.splitTextToSize(order.product.name, descColWidth);
        doc.text(nameLines, 40, y);

        // qty / unit price / total on first line
        doc.text(String(order.quantity), 300, y, { align: 'right' });
        doc.text(`${order.product.price} gwei`, 380, y, { align: 'right' });
        doc.text(`${productTotal} gwei`, 550, y, { align: 'right' });

        // advance y
        y += nameLines.length * lineHeight + 10;

        // ── Line Item: Logistics
        const logisticsUnitCost = Number(order.distancePrice);
        const halfLogistics = (order.distance * logisticsUnitCost) / 2;
        const fullLogistics = order.distance * logisticsUnitCost;
        doc.text("Logistics (½ cost)", 40, y);
        doc.text(
            `${order.distance} km @ ${logisticsUnitCost} gwei/km`,
            300,
            y,
            { align: 'right' }
        );
        doc.text(`${halfLogistics} gwei`, 550, y, { align: 'right' });
        y += 40;

        // ── Totals
        doc.setFont('helvetica', 'bold');
        doc.text("Subtotal", 380, y, { align: 'right' });
        doc.text(`${productTotal} gwei`, 550, y, { align: 'right' });
        y += 20;
        doc.setFontSize(14);
        doc.text("Amount payable", 380, y, { align: 'right' });
        doc.text(
            `${productTotal + halfLogistics} gwei`,
            550,
            y,
            { align: 'right' }
        );
        y += 40;
        doc.setFont('helvetica', 'normal').setFontSize(10);
        doc.text(`Total logistics price: ${fullLogistics} gwei`, 40, y);
        y += 40;
        doc.setFont('helvetica', 'italic').setFontSize(10);
        doc.text(
            "Thank you for choosing Blockcart! Visit us again",
            40,
            y
        );
        doc.save(`invoice_${order.orderId}.pdf`);
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
                            {o.status === 'delivered' && (
                                <button
                                    onClick={() => handleGenerateInvoice(o)}
                                    className="mt-4 mx-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium transition-all"
                                >
                                    Generate Invoice
                                </button>
                            )}
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

                                {(o.status !== 'delivered' && o.status !== 'cancelled') ? ((o.paymentStatus) ?
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
                                    </> :
                                    <button onClick={() => { handleDepositAmount(o) }} className='mt-4 mx-2 px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md font-medium transition-all'>
                                        Deposit Payment
                                    </button>) :
                                    (<></>)
                                }
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
