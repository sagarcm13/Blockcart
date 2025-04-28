import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useLocation } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
export default function UserMenu({ isAuthenticated, onLogout }) {
    const [email, setEmail] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setEmail(null);
            return;
        }
        try {
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            if (decodedToken.exp && decodedToken.exp < currentTime) {
                localStorage.removeItem('token');
                return;
            }
            setEmail(decodedToken.email);
        } catch (e) {
            console.error('Invalid token', e);
            localStorage.removeItem('token');
        }
    }, [isAuthenticated, location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setEmail(null);
        setMenuOpen(false);
        onLogout();
        navigate('/login');
    };

    return (
        <div className="relative">
            {email ? (
                <div className="relative">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center focus:outline-none">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                            alt="User Icon"
                            className="h-8 w-8 rounded-full"
                        />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-md py-1 z-10">
                            <div className="px-4 py-2 border-b text-black">{email}</div>
                            <button onClick={handleLogout} className="w-full text-left text-black px-4 py-2 flex items-center hover:bg-gray-100">
                                <svg className="h-5 text-black w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-2a4 4 0 100-8m0 8v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <button
                    onClick={() => navigate('/login')}
                    className="bg-teal-500 text-white p-2 rounded-lg"
                >
                    Login
                </button>
            )}
        </div>
    );
}