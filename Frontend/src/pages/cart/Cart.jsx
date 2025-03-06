import { useEffect, useState } from 'react';
import { useCartDetail } from '../../api';
import { useNavigate, Link } from 'react-router-dom';
import { isTokenExpired } from '../../utils/jwtCheck';
import PopUp from '../../components/PopUp';
import { useMutation } from 'react-query';
import axiosClient from './../../axios';
import { notify } from '../../components/Notification';
import ErrorUI from './../../components/ErrorUI.jsx'
import LoaderWithKeyframes from './../../components/Loaders.jsx'

export default function Cart() {
  const [list, setList] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isTokenChecked, setIsTokenChecked] = useState(false);
  const navigate = useNavigate();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const mutation = useMutation((data) =>
    axiosClient.delete("/removeCartItem", { headers: { 'x-auth-token': localStorage.getItem("token") }, data }), {
    onSuccess: (response) => {
      notify('Item removed from cart', 'success');
      console.log('Success:', response.data);
    },
    onError: (error) => {
      notify('Failed to remove item from cart', 'error');
      console.error('Error:', error);
    }
  });

  const handleOpenPopup = () => setIsPopupOpen(true);
  const handleClosePopup = () => setIsPopupOpen(false);

  const handleConfirm = () => {
    console.log('Confirmed!');
    setIsPopupOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    if (!isTokenChecked) {
      const token = localStorage.getItem('token');
      if (!token || isTokenExpired(token)) {
        handleOpenPopup();
      } else {
        setIsTokenChecked(true);
      }
    }
  }, [isTokenChecked, navigate]);

  const { data, isFetched, isError, error } = useCartDetail();

  useEffect(() => {
    if (data) {
      let datalist = data.map(obj => ({ ...obj, value: 1 }));
      setCartData(datalist);
    }
  }, [data]);

  const handleRemove = (id) => {
    const removed = cartData.filter(o => o._id !== id);
    setCartData(removed);
    mutation.mutate({ id });
  };

  useEffect(() => {
    let price = cartData.reduce((price, item) => price + item.price * item.value, 0);
    setTotalPrice(price);
    let items = cartData.map((obj) => (
      <li className='text-white md:m-5 flex-col justify-center' key={obj._id}>
        <div className="box md:m-5 m-2 p-5 flex flex-col md:flex-row justify-center border-2 rounded-lg shadow-lg bg-gray-800">
          <div className="img flex-shrink-0 flex justify-center">
            <img src={obj.Images.i1} width={150} height={150} alt="" className="rounded-lg" />
          </div>
          <div className="right md:ml-10 space-y-5 flex-grow flex-col justify-center">
            <Link to='/product' state={{ id: obj._id }}>
              <div className="md:text-2xl text-l font-bold text-white">{obj.name}</div>
            </Link>
            <div className="text-xl text-gray-300">Price: <span className="text-white">₹{obj.price}</span></div>
            <div className="flex items-center space-x-2 justify-center">
              <div className="text-xl text-gray-300">Qty</div>
              <button
                className='p-2 border-2 border-gray-500 rounded-md bg-gray-700 hover:bg-gray-600 transition-all'
                onClick={() => {
                  const update = cartData.map(o => o._id === obj._id ? { ...o, value: o.value + 1 } : o);
                  setCartData(update);
                }}
              >+</button>
              <input
                type="text"
                className='w-12 text-black text-center p-1 border-2 rounded-md'
                id={obj._id}
                name="name"
                value={obj.value}
                pattern="[0-9]"
                title="Quantity"
                min={1}
                readOnly
              />
              <button
                onClick={() => {
                  const update = cartData.map(o => o._id === obj._id && o.value > 1 ? { ...o, value: o.value - 1 } : o);
                  setCartData(update);
                }}
                className='p-2 border-2 border-gray-500 rounded-md bg-gray-700 hover:bg-gray-600 transition-all'
              >-</button>
            </div>
            <div className="flex space-x-4 mt-4 justify-center">
              <button
                className='border-2 rounded-lg p-2 bg-red-600 text-white hover:bg-red-500 transition-all'
                onClick={() => handleRemove(obj._id)}
              >Remove</button>
              <button className='border-2 rounded-lg p-2 bg-green-600 text-white hover:bg-green-500 transition-all'>Buy Now</button>
            </div>
          </div>
        </div>
      </li>
    ));

    setList(items);
  }, [cartData]);

  if (isPopupOpen) {
    return (<PopUp isOpen={isPopupOpen} onClose={handleClosePopup} onConfirm={handleConfirm} />)
  }

  return (
    <div className="p-5">
      <div className='text-3xl font-bold text-center text-white mb-8'>Shopping Cart</div>
      <div className='text-2xl text-gray-300 mb-8 text-center'>
        Subtotal ({cartData.length} items): <span className="text-white">₹{totalPrice}</span>
      </div>
      {cartData.length < 1 && isFetched && !isError && (
        <div className='text-xl text-white text-center'>No cart items found</div>
      )}
      {isError && (<ErrorUI errorMessage={error.message} />)}
      {!isFetched && <LoaderWithKeyframes />}
      <ol className='list-decimal'>
        {list}
      </ol>
    </div>
  );
}