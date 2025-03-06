import { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import axiosClient from './../axios';
import PopUp from './PopUp';
import { useNavigate } from 'react-router-dom';
import { notify } from './Notification'
// eslint-disable-next-line react/prop-types
export default function AddToCart({ id }) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const navigate = useNavigate();

    const handleConfirm = () => {
        console.log('Confirmed!');
        setIsPopupOpen(false);
        navigate('/login');
    };

    const handleOpenPopup = () => setIsPopupOpen(true);
    const handleClosePopup = () => setIsPopupOpen(false);

    const handleClick = () => {
        mutation.mutate({ id });
    }

    const mutation = useMutation((data) =>
        axiosClient.post("/AddToCart", data, { headers: { 'x-auth-token': localStorage.getItem("token") }, }), {
        onSuccess: (response) => {
            console.log('Success:', response.data);
            notify('Item added from cart', 'success');
        },
        onError: (error) => {
            notify('Failed to add item from cart', 'error');
            console.error('Error:', error);
        }
    });

    useEffect(() => {
        if (mutation.isError) {
            handleOpenPopup();
        }
    }, [mutation.isError]);

    return (
        <>
            <button onClick={handleClick} className='bg-teal-500 m-4 text-l md:text-xl font-bold text-white p-2 rounded-xl'>Add to cart</button>
            {isPopupOpen && (
                <PopUp isOpen={isPopupOpen} onClose={handleClosePopup} onConfirm={handleConfirm} />
            )}
        </>
    );
}
