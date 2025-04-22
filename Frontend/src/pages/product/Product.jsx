import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ProductLeft from './ProductLeft.jsx';
import ProductRight from './ProductRight.jsx';
import LoaderWithKeyframes from './../../components/Loaders.jsx';
import ErrorUI from './../../components/ErrorUI.jsx';
import { useContracts } from './../../components/useContracts';

export default function Product() {
  const { state } = useLocation();
  const { id } = state;
  const [productData, setProductData] = useState();
  const [loading, setLoading] = useState(true);
  const [errorui, setError] = useState(null);
  const { productRegistry } = useContracts();

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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getProductData();
  }, [productRegistry, id]);

  return (
    <div className='flex flex-col md:flex-row'>
      {loading && <LoaderWithKeyframes />}
      {errorui && <ErrorUI message={errorui} />}
      {!loading && !errorui && (
        <>
          <ProductLeft data={productData} />
          <ProductRight data={productData} />
        </>
      )}
    </div>
  );
}
