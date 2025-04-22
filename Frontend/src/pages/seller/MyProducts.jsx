import { useState, useEffect } from 'react';
import { useContracts } from '../../components/useContracts';

export default function MyProducts() {
    const { connect, signer, productRegistry } = useContracts();
    const [myProducts, setMyProducts] = useState([]);

    useEffect(() => {
        connect().catch(console.error);
    }, [connect]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const products = await productRegistry.connect(signer).getMyProducts();
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
            } catch (err) {
                console.error('Error fetching products:', err);
            }
        };
        fetchProducts();
    }, [productRegistry, signer]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProducts.length > 0 && myProducts.map(product => (
                <div key={product.id} className="bg-gray-800 rounded-lg p-6">
                    <div className="aspect-w-16 aspect-h-9 mb-4">
                        <img
                            src={`https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${product.imageHashes[0]}`}
                            alt={product.name}
                            className="object-cover rounded-lg"
                        />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-400 mb-4">{product.description}</p>
                    <p className="text-2xl font-bold">{product.price} gwei</p>
                </div>
            ))
            }{myProducts.length === 0 && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-gray-800 rounded-lg p-6 text-center">
                    <p className="text-xl font-semibold">No products found</p>
                </div>
            )}
        </div>
    )
}