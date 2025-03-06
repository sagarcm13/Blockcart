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
    const mutation = useMutation((data) =>
        axiosClient.post("/login", data), {
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
        return <span>Submitting...</span>;
    }
    if (mutation.isError) {
        return <div className='text-center text-white text-2xl'>Error: {mutation.error.response.data.message}</div>;
    }
    return (
        <>
            <div className='flex justify-center mt-20 '>
                <form onSubmit={submitData} className='text-white p-10 border-2 border-white flex justify-center flex-col space-y-6 bg-white rounded-2xl'>
                    <input type="email" className='text-black rounded-2xl p-3' placeholder='Email' name="" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <div className='flex'>
                        <input type="password" className='text-black rounded-2xl p-3 ' placeholder='Password' name="" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <img src="https://cdn-icons-png.flaticon.com/128/10910/10910442.png" className='py-1 m-1' id='img' onClick={view} width={30} height={5} alt="" />
                    </div>
                    <input type="submit" className='bg-blue-600 rounded-2xl p-1' value="Submit" />
                    <div className='text-black text-xs'> Don&apos;t have an account &nbsp;<Link to={`/sign_up`} className='text-blue-600'>sign up</Link>
                    </div>
                </form>
            </div>
        </>
    )
}