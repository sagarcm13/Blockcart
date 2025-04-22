import { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { useContracts } from './../../components/useContracts';
import axiosClient from "../../axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

export default function CheckoutPage() {
    const { state } = useLocation();
    const { id } = state;
    const navigate = useNavigate();
    const { productRegistry } = useContracts();
    const [productData, setProductData] = useState(null);
    useEffect(() => {
        const getProductData = async () => {
            if (!productRegistry || !id) return;
            try {
                const rawProduct = await productRegistry.getProduct(id);
                const formatted = {
                    id: rawProduct[0].toString(),
                    address: rawProduct[1],
                    email: rawProduct[2],
                    name: rawProduct[3],
                    description: rawProduct[4],
                    productType: rawProduct[5],
                    price: rawProduct[6].toString(),
                    count: rawProduct[7].toString(),
                    imageHashes: Object.values(rawProduct[8]),
                    features: Object.values(rawProduct[9]),
                };
                setProductData(formatted);
            } catch (err) {
                console.error("Error fetching product:", err);
            }
        };

        getProductData();
    }, [productRegistry, id]);

    const [form, setForm] = useState({
        destination: "",
        quantity: 1,
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        let decodedEmail = null;
    
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
    
                if (decodedToken.userType !== 'buyer') {
                    alert('You are not buyer to view this page login with buyer account to add product');
                    navigate('/login');
                    return;
                }
    
                decodedEmail = decodedToken.email; // use this directly
            } catch (e) {
                console.error('Invalid token', e);
                alert('Please login again session expired');
                navigate('/login');
                localStorage.removeItem('token');
                return;
            }
        } else {
            alert('Please login to view your orders');
            navigate('/login');
            return;
        }
    
        console.log("Using email:", decodedEmail);
    
        try {
            const response = await axiosClient.post("/api/orders", {
                orderId: Date.now(),
                productId: id,
                destination: form.destination,
                orderStatus: "pending",
                email: decodedEmail, // use the local variable
                quantity: form.quantity
            });
    
            if (response.status === 201) {
                alert("Order placed successfully!");
                console.log("Order response:", response.data);
                navigate("/orders");
            } else {
                alert("Error placing order. Please try again.");
                console.error("Order error:", response.data);
            }
        } catch (error) {
            console.error("Error submitting order:", error);
            alert("Error placing order. Please try again.");
            return;
        }
        setForm({
            destination: "",
            quantity: 1,
        });
    };
    
    if (!productData) {
        return (
            <div className="text-center mt-10 text-gray-600">
                Loading product details...
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-10">
            <h1 className="text-2xl font-bold mb-4">Checkout</h1>

            {/* Product Details */}
            <div className="mb-6 border-b pb-4">
                <h2 className="text-xl font-semibold">{productData.name}</h2>
                <p className="text-gray-600 mt-1">{productData.description}</p>
                <p className="text-lg font-medium mt-2">Price: ₹{productData.price}</p>
                <p className="text-sm text-gray-500">Available Quantity: {productData.count}</p>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-medium mb-1">Destination</label>
                    <input
                        type="text"
                        name="destination"
                        value={form.destination}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter shipping address"
                    />
                </div>

                <div>
                    <label className="block font-medium mb-1">Quantity</label>
                    <input
                        type="number"
                        name="quantity"
                        value={form.quantity}
                        onChange={handleChange}
                        min="1"
                        max={productData.count}
                        required
                        className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
                >
                    Place Order
                </button>
            </form>
        </div>
    );
}
