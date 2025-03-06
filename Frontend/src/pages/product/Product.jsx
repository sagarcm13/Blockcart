import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import ProductLeft from './ProductLeft.jsx';
import ProductRight from './ProductRight.jsx';
import { useProductDetail } from '../../api.js';
import LoaderWithKeyframes from './../../components/Loaders.jsx'
import ErrorUI from './../../components/ErrorUI.jsx'

export default function Product() {
  const { state } = useLocation();
  const params = state;
  const { data, isFetched, isError, error } = useProductDetail(params.id);
  const [productData, setProductData] = useState(data);
  useEffect(() => {
    setProductData(data);
  }, [data]);
  return (
    <div className='flex flex-col md:flex-row'>
      {!isFetched && <LoaderWithKeyframes />}
      {isError && <ErrorUI errorMessage={error.message} />}
      <ProductLeft data={productData} />
      <ProductRight data={productData} />
    </div>
  )
}

