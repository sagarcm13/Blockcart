import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from 'react-query';
import axiosClient from '../../axios';
import { useNavigate } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [user, setUser] = useState('buyer');
    const mutation = useMutation((data) =>
        axiosClient.post("/api/auth/login", data), {
        onSuccess: (response) => {
            console.log('Success:', response.data);
            localStorage.setItem("token", response.data.token);
            onLogin();
            navigate('/')
        }
    }
    );
    const view = () => {
        let t = document.getElementById('password');
        let img = document.getElementById('img');
        if (t.type === 'password') {
            t.type = 'text';
            img.src = 'https://cdn-icons-png.flaticon.com/128/11502/11502541.png';
        } else {
            t.type = 'password';
            img.src = 'https://cdn-icons-png.flaticon.com/128/10910/10910442.png';
        }
    }
    const submitData = async (event) => {
        event.preventDefault();
        mutation.mutate({ email, password });
        setEmail('');
        setPassword('');
    };
    if (mutation.isLoading) {
        return <span className='text-white'>Submitting...</span>;
    }
    if (mutation.isError) {
        return <div className='text-center text-white text-2xl'>Error: {mutation.error.response.data.message}</div>;
    }
    return (
        <>
            <div className='flex justify-center mt-20 '>
                <form onSubmit={submitData} className='text-white p-10 border-2 border-white flex justify-center flex-col space-y-6 bg-white rounded-2xl'>
                    <div className='flex justify-center text-black font-bold'><div>Login</div></div>
                    <div className='flex justify-center space-x-6'>
                        <div className='flex flex-col'>
                            <label className='text-black font-normal'>Buyer</label>
                            <input type="radio" name="drone" value="buyer" checked={user === "buyer"} onChange={() => setUser('buyer')} />
                        </div>
                        <div className='flex flex-col'>
                            <label className='text-black font-normal'>Seller</label>
                            <input type="radio" name="drone" value="seller" checked={user === "seller"} onChange={() => setUser('seller')} />
                        </div>
                        <div className='flex flex-col'>
                            <label className='text-black font-normal'>Logistics</label>
                            <input type="radio" name="drone" value="logistics" checked={user === "logistics"} onChange={() => setUser('logistics')} />
                        </div>
                    </div>
                    <input type="email" className='text-black rounded-2xl p-3 border-2 focus:outline-none' placeholder='Email' name="" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <div className='flex border-2 rounded-2xl'>
                        <input type="password" className='text-black rounded-2xl p-3 focus:outline-none' placeholder='Password' name="" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <img src="https://cdn-icons-png.flaticon.com/128/10910/10910442.png" className='py-1 m-1' id='img' onClick={view} width={30} height={5} alt="" />
                    </div>
                    <input type="submit" className='bg-blue-600 rounded-2xl p-1 cursor-pointer' value="Submit" />
                    <div className='text-black text-xs'> Don&apos;t have an account &nbsp;<Link to={`/sign_up`} className='text-blue-600'>sign up</Link>
                    </div>
                </form>
            </div>
        </>
    )
}