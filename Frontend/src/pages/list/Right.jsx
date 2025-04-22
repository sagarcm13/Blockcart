import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AddToCart from './../../components/AddToCart';
import LoaderWithKeyframes from './../../components/Loaders.jsx';
import ErrorUI from './../../components/ErrorUI.jsx';
import { useContracts } from './../../components/useContracts';

// eslint-disable-next-line react/prop-types
export default function Right({ type, filter, sortBy }) {
    const [rawProductData, setRawProductData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { productRegistry } = useContracts();

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                if (!productRegistry) return;
                const products = await productRegistry.getProductsByType(type);
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
                setRawProductData(formatted);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProducts();
    }, [type, productRegistry]);

    // Apply filters and sorting
    useEffect(() => {
        const applyingFilter = (data, filter, sortBy) => {
            let filteredData = [...data];

            if (filter === 'b20') {
                filteredData = filteredData.filter(item => item.price < 20000);
            } else if (filter === '20-45') {
                filteredData = filteredData.filter(item => item.price >= 20000 && item.price < 45000);
            } else if (filter === 'a45') {
                filteredData = filteredData.filter(item => item.price >= 45000);
            }

            if (sortBy === 'htl') {
                filteredData.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            } else if (sortBy === 'lth') {
                filteredData.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            }

            return filteredData;
        };

        const filtered = applyingFilter(rawProductData, filter, sortBy);
        setFilteredData(filtered);
    }, [rawProductData, filter, sortBy]);

    return (
        <div className='float-r w-[70%] md:w-[75%] flex'>
            <ul className="flex-col w-full">
                {loading && <LoaderWithKeyframes />}
                {error && <ErrorUI errorMessage={error} />}
                {!loading && !error && filteredData.length === 0 && (
                    <div className='flex justify-center items-center h-full'>
                        <h1 className='text-white text-2xl'>No products found</h1>
                    </div>
                )}
                {!loading && !error && filteredData.length > 0 && filteredData.map(item => (
                    <li className='flex flex-col justify-center' id={item.id} key={item.id}>
                        <div className='flex flex-col md:flex-row border-white border-2 border-r-0 rounded-xl'>
                            <div className="md:float-l md:w-[30%] flex justify-center my-5 md:m-6">
                                <img
                                    src={`https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${item.imageHashes[0]}`}
                                    height={200}
                                    width={200}
                                    alt={item.name}
                                />
                            </div>
                            <div className="md:float-r flex flex-col md:block md:w-[70%] mx-6 md:m-6">
                                <Link to='/product' state={{ id: item.id }}>
                                    <div className="desc text-white text-l md:text-2xl font-bold md:m-2">
                                        {item.description}
                                    </div>
                                    <div className="price text-white text-xl md:text-3xl md:m-2">
                                        {item.price}gwei
                                    </div>
                                </Link>
                                <AddToCart id={item.id} />
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}