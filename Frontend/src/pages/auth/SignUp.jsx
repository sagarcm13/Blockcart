import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from 'react-query';
import axiosClient from '../../axios';
import { useNavigate } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
export default function SignUp({ onLogin }) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState();
    const [password, setPassword] = useState('');
    const [cpassword, setCPassword] = useState('');
    const [userType, setuserType] = useState('buyer');
    const navigate = useNavigate();
    const mutation = useMutation((data) =>
        axiosClient.post("/api/auth/register", data), {
        onSuccess: (response) => {
            console.log('Success:', response.data);
            localStorage.setItem("token", response.data.token);
            onLogin();
            navigate('/')
        },
        onError: (error) => {
            console.error('Error:', error.response.data.message);
            alert(error.response.data.message);
        }
    }
    );
    const view = (i, pas) => {
        let t = document.getElementById(pas);
        let img = document.getElementById(i);
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
        if (password !== cpassword) {
            alert("password and confirm password mismatch")
            return
        }
        mutation.mutate({ email, password, userType, name, phone });
        setEmail('');
        setPassword('');
        setCPassword('');
        setName('');
        setPhone('');
    };
    return (
        <div className='flex justify-center mt-20 '>
            <form onSubmit={submitData} className='text-white p-10 border-2 border-white flex justify-center flex-col space-y-6 bg-white rounded-2xl'>
                <div className='flex justify-center text-black font-bold'><div>Sign Up</div></div>
                <div className='flex justify-center space-x-6'>
                    <div className='flex flex-col'>
                        <label className='text-black font-normal'>Buyer</label>
                        <input type="radio" name="drone" value="buyer" checked={userType === "buyer"} onChange={() => setuserType('buyer')} />
                    </div>
                    <div className='flex flex-col'>
                        <label className='text-black font-normal'>Seller</label>
                        <input type="radio" name="drone" value="seller" checked={userType === "seller"} onChange={() => setuserType('seller')} />
                    </div>
                    <div className='flex flex-col'>
                        <label className='text-black font-normal'>Logistics</label>
                        <input type="radio" name="drone" value="logistics" checked={userType === "logistics"} onChange={() => setuserType('logistics')} />
                    </div>
                </div>
                <input type="email" className='text-black rounded-2xl p-3' placeholder='Email' name="" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type="text" className='text-black rounded-2xl p-3' placeholder='Name' name="" id="name" value={name} onChange={(e) => setName(e.target.value)} />
                <input type="tel" className='text-black rounded-2xl p-3' placeholder='Phone no' name="" id="phone" value={phone} onChange={(e) => setPhone(parseFloat(e.target.value))} maxLength={13} pattern="[0-9]{10}" />
                <div className='flex'>
                    <input type="password" className='text-black rounded-2xl p-3 ' placeholder='Password' name="" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <img src="https://cdn-icons-png.flaticon.com/128/10910/10910442.png" className='py-1 m-1' id='img1' onClick={() => view('img1', 'password')} width={30} height={5} alt="" />
                </div>
                <div className='flex'>
                    <input type="password" className='text-black rounded-2xl p-3' placeholder='Confirm Password' name="" id="cpassword" value={cpassword} onChange={(e) => setCPassword(e.target.value)} />
                    <img src="https://cdn-icons-png.flaticon.com/128/10910/10910442.png" className='py-1 m-1' id='img2' onClick={() => view('img2', 'cpassword')} width={30} height={5} alt="" />
                </div>
                <input type="submit" className='bg-blue-600 rounded-2xl p-1' value="Submit" />
                <div className='text-black text-xs'>already have an account &nbsp;<Link to={`/login`} className='text-blue-600'>sign in</Link>
                </div>
            </form>
        </div>
    )
}