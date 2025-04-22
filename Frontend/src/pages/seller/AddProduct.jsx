// src/components/Seller/AddProduct.jsx
import { useState, useEffect } from 'react';
import pinata from './../../pinata';
import { useContracts } from '../../components/useContracts';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

export default function AddProduct() {
    const { connect, signer, productRegistry } = useContracts();
    const [sellerEmail, setEmail] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const initConnection = async () => {
            try {
                await connect();
            } catch (err) {
                console.error('Error connecting:', err);
            }
        };
        initConnection();
    }, []);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        productType: '',
        price: 0,
        count: 0,
        features: ['', '', '', ''],
        imageHashes: ['', '', '', ''],
    });
    const [imagePreviews, setImagePreviews] = useState(['', '', '', '']);

    // handlers
    const handleFeatureChange = (index, value) => {
        setNewProduct(prev => {
            const features = [...prev.features];
            features[index] = value;
            return { ...prev, features };
        });
    };

    const handleImageUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const { cid } = await pinata.upload.public.file(file);
            setNewProduct(prev => {
                const hashes = [...prev.imageHashes];
                hashes[index] = cid;
                return { ...prev, imageHashes: hashes };
            });
            setImagePreviews(prev => {
                const previews = [...prev];
                previews[index] = URL.createObjectURL(file);
                return previews;
            });
        } catch (err) {
            console.error('Pinata upload error:', err);
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
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
                if (decodedToken.userType !== 'seller') {
                    alert('You are not buyer to view this page login with seller account to add product');
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
            alert('Please login to view your orders');
            navigate('/login');
        }
        const backup = { ...newProduct };
        setNewProduct({
            name: '',
            description: '',
            productType: '',
            price: 0,
            count: 0,
            features: ['', '', '', ''],
            imageHashes: ['', '', '', ''],
        });
        setImagePreviews(['', '', '', '']);

        try {
            const tx = await productRegistry
                .connect(signer)
                .addProduct(
                    backup.name,
                    backup.description,
                    backup.productType,
                    backup.price,
                    backup.count,
                    backup.imageHashes,
                    backup.features,
                    sellerEmail
                );
            console.log('Tx sent:', tx.hash);
            await tx.wait();
            console.log('Product added on‑chain');
        } catch (err) {
            console.error('Error adding product:', err);
            setNewProduct(backup);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-10">
            <div className="space-y-6 p-6 bg-gray-800 rounded-lg">
                <h2 className="text-xl font-semibold">1. Basic Info</h2>
                <div>
                    <label className="block text-sm font-medium">Product Name</label>
                    <input
                        type="text"
                        value={newProduct.name}
                        onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-gray-700 rounded p-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea
                        value={newProduct.description}
                        onChange={e => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-gray-700 rounded p-2"
                        rows="4"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Product Type</label>
                    <input
                        type="text"
                        value={newProduct.productType}
                        onChange={e => setNewProduct(prev => ({ ...prev, productType: e.target.value }))}
                        className="w-full bg-gray-700 rounded p-2"
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Price (gwei)</label>
                        <input
                            type="number"
                            value={newProduct.price}
                            onChange={e => setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                            className="w-full bg-gray-700 rounded p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Count</label>
                        <input
                            type="number"
                            value={newProduct.count}
                            onChange={e => setNewProduct(prev => ({ ...prev, count: parseInt(e.target.value, 10) }))}
                            className="w-full bg-gray-700 rounded p-2"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* 2. Features */}
            <div className="space-y-6 p-6 bg-gray-800 rounded-lg">
                <h2 className="text-xl font-semibold">2. Features</h2>
                {newProduct.features.map((feat, idx) => (
                    <input
                        key={idx}
                        type="text"
                        value={feat}
                        onChange={e => handleFeatureChange(idx, e.target.value)}
                        className="w-full bg-gray-700 rounded p-2"
                        placeholder={`Feature ${idx + 1}`}
                        required
                    />
                ))}
            </div>

            {/* 3. Upload Images */}
            <div className="space-y-6 p-6 bg-gray-800 rounded-lg">
                <h2 className="text-xl font-semibold">3. Upload Images</h2>
                {newProduct.imageHashes.map((hash, idx) => (
                    <div key={idx} className="mb-4">
                        <label className="block text-sm font-medium">Image {idx + 1}</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => handleImageUpload(e, idx)}
                            className="w-full bg-gray-700 rounded p-2"
                            required
                        />
                        {imagePreviews[idx] && (
                            <img
                                src={imagePreviews[idx]}
                                alt={`Preview ${idx + 1}`}
                                className="mt-2 w-full object-cover rounded"
                            />
                        )}
                    </div>
                ))}
            </div>

            <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
                Add Product
            </button>
        </form>
    );
};
