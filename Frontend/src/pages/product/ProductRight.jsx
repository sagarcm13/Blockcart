import { useEffect, useState } from 'react'
import AddToCart from './../../components/AddToCart'
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line react/prop-types
export default function ProductRight({ data }) {
    const navigate = useNavigate();
    const [productData, setProductData] = useState(data);
    useEffect(() => {
        setProductData(data);
    }, [data]);
    const checkout = () => {
        console.log(productData.id);
        navigate('/checkout', { state: { id: productData.id } });
    }
    if (productData === undefined) {
        return <div>Loading...</div>;
    } else {
        return (
            <div className='md:w-[60%] md:float-right'>
                <div className="m-3">
                    <div className='text-3xl font-bold text-white m-5 ml-10 mt-10'>{productData.description}</div>
                    <div className='text-3xl font-bold text-white m-5 ml-10'>{productData.price} gwei</div>
                    <div className="text-2xl font-bold text-white ml-10 m-4 mt-10">Key features</div>
                    <ul className="box border-gray-300 list-disc mx-5 mt-10 px-10 py-5 border-2">
                        <li className="text-white text-2xl font-thin">{productData.features[0]}</li>
                        <li className="text-white text-2xl font-thin">{productData.features[1]}</li>
                        <li className="text-white text-2xl font-thin">{productData.features[2]}</li>
                        <li className="text-white text-2xl font-thin">{productData.features[3]}</li>
                    </ul>
                    <div className="m-10 flex justify-center">
                        <AddToCart id={productData._id} />
                        <button onClick={checkout} className='bg-yellow-400 m-4 text-xl font-bold text-white p-2 rounded-xl'> Buy now</button>
                    </div>
                </div>
            </div>
        )
    }
}