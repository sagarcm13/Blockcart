import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContracts } from '../../components/useContracts';
export default function Cart() {
  const [cartIds, setCartIds] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const { productRegistry } = useContracts();
  const navigate = useNavigate();
  const getProductData = async (id) => {
    if (!productRegistry || id == null) return null;
    try {
      const raw = await productRegistry.getProduct(id);
      return {
        _id: Number(raw[0].toString()),
        address: raw[1],
        email: raw[2],
        name: raw[3],
        description: raw[4],
        productType: raw[5],
        price: Number(raw[6].toString()),
        count: Number(raw[7].toString()),
        imageHashes: raw[8],
        features: raw[9],
        value: 1
      };
    } catch (err) {
      console.error("Error fetching product", err);
      return null;
    }
  };

  function removeFromCart(id) {
    const numericId = Number(id);
    let existing = [];
    try {
      existing = JSON.parse(localStorage.getItem('cart') || '[]');
      if (!Array.isArray(existing)) existing = [];
    } catch {
      existing = [];
    }
    existing = existing.map(item => Number(item));
    const updated = existing.filter(item => item !== numericId);
    localStorage.setItem('cart', JSON.stringify(updated));
    return updated;
  }

  useEffect(() => {
    let stored = [];
    try {
      stored = JSON.parse(localStorage.getItem('cart') || '[]');
      console.log(stored);
      if (!Array.isArray(stored)) stored = [];
    } catch {
      stored = [];
    }
    setCartIds(stored);
  }, []);

  // 2️⃣ Whenever cartIds change: fetch all products
  useEffect(() => {
    if (cartIds.length === 0) {
      setCartData([]);
      return;
    }
    const load = async () => {
      const proms = cartIds.map(id => getProductData(id));
      const results = await Promise.all(proms);
      setCartData(results.filter(p => p !== null));
    };
    load();
  }, [cartIds]);

  // 3️⃣ Recalculate totalPrice whenever cartData changes
  useEffect(() => {
    const sum = cartData.reduce((acc, item) => acc + item.price * item.value, 0);
    setTotalPrice(sum);
  }, [cartData]);

  const handleRemove = (id) => {
    const updatedIds = removeFromCart(id);
    setCartIds(updatedIds);
    setCartData(cd => cd.filter(item => item._id !== id));
  };

  return (
    <div className="p-5">
      <div className="text-3xl font-bold text-center text-white mb-8">
        Shopping Cart
      </div>
      <div className="text-2xl text-gray-300 mb-8 text-center">
        Subtotal ({cartData.length} items):{' '}
        <span className="text-white">₹{totalPrice.toFixed(2)}</span>
      </div>
      <ol className="list-decimal">
        {cartData.map(obj => (
          <li
            className="text-white md:m-5 flex-col justify-center"
            key={obj._id}
          >
            <div className="box md:m-5 m-2 p-5 flex flex-col md:flex-row justify-center border-2 rounded-lg shadow-lg bg-gray-800">

              {/* Image */}
              <div className="img flex-shrink-0 flex justify-center">
                {/* adjust this URL pattern to match your IPFS gateway or host */}
                <img
                  src={`https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${obj.imageHashes[0]}`}
                  width={150}
                  height={150}
                  alt={obj.name}
                  className="rounded-lg"
                />
              </div>

              {/* Details */}
              <div className="right md:ml-10 space-y-5 flex-grow flex-col justify-center">
                <Link to="/product" state={{ id: obj._id }}>
                  <div className="md:text-2xl text-l font-bold text-white">
                    {obj.name}
                  </div>
                </Link>
                <div className="text-xl text-gray-300">
                  Price:{' '}
                  <span className="text-white">₹{obj.price.toFixed(2)}</span>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center space-x-2 justify-center">
                  <div className="text-xl text-gray-300">Qty</div>
                  <button
                    className="p-2 border-2 border-gray-500 rounded-md bg-gray-700 hover:bg-gray-600 transition-all"
                    onClick={() => {
                      setCartData(cd =>
                        cd.map(o =>
                          o._id === obj._id
                            ? { ...o, value: o.value + 1 }
                            : o
                        )
                      );
                    }}
                  >
                    +
                  </button>
                  <input
                    type="text"
                    className="w-12 text-black text-center p-1 border-2 rounded-md"
                    value={obj.value}
                    readOnly
                  />
                  <button
                    className="p-2 border-2 border-gray-500 rounded-md bg-gray-700 hover:bg-gray-600 transition-all"
                    onClick={() => {
                      setCartData(cd =>
                        cd.map(o =>
                          o._id === obj._id && o.value > 1
                            ? { ...o, value: o.value - 1 }
                            : o
                        )
                      );
                    }}
                  >
                    -
                  </button>
                </div>

                {/* Actions */}
                <div className="flex space-x-4 mt-4 justify-center">
                  <button
                    className="border-2 rounded-lg p-2 bg-red-600 text-white hover:bg-red-500 transition-all"
                    onClick={() => handleRemove(obj._id)}
                  >
                    Remove
                  </button>
                  <button onClick={() => navigate('/Checkout', { state: { id: obj._id } })} className="border-2 rounded-lg p-2 bg-green-600 text-white hover:bg-green-500 transition-all">
                    Buy Now
                  </button>
                </div>
              </div>

            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
