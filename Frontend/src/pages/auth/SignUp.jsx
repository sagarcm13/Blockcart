import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from 'react-query';
import axiosClient from '../../axios';
import { useNavigate } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
export default function SignUp({ onLogin }) {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCPassword] = useState('');
  const navigate = useNavigate();
  const mutation = useMutation((data) =>
    axiosClient.post("/sign_up", data), {
    onSuccess: (response) => {
      console.log('Success:', response.data);
      localStorage.setItem("token", response.data.token);
      onLogin();
      navigate('/')
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
    mutation.mutate({ userName, email, password });
    setEmail('');
    setUserName('');
    setPassword('');
    setCPassword('');
  };
  return (
    <div className='flex justify-center mt-20 '>
      <form onSubmit={submitData} className='text-white p-10 border-2 border-white flex justify-center flex-col space-y-6 bg-white rounded-2xl'>
        <input type="text" className='text-black  rounded-2xl p-3' name="" placeholder='Username' id="name" value={userName} onChange={(e) => setUserName(e.target.value)} />
        <input type="email" className='text-black rounded-2xl p-3' placeholder='Email' name="" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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