import { useEffect, useState } from 'react'
import { useContracts } from './../../components/useContracts';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
export default function BecomeProvider() {
    const navigate = useNavigate();
    const [email, setEmail] = useState(null);
    const [providerForm, setProviderForm] = useState({
        emailId: '',
        distancePrice: 0,
        walletAddress: ''
    });
    const { connect, signer, logistics } = useContracts();
    useEffect(() => {
        const fetchAddress = async () => {
            if (!signer) return;
            try {
                const address = await signer.getAddress();
                setProviderForm(prev => ({
                    ...prev,
                    walletAddress: address
                }));
            } catch (err) {
                console.error("Failed to get address:", err);
            }
        };
        fetchAddress();
    }, [signer]);

    const handleFormSubmit = async (e) => {
        if (!signer) {
            await connect();
        }
        const logisticsWithSigner = logistics.connect(signer);
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                if (decodedToken.exp && decodedToken.exp < currentTime) {
                    localStorage.removeItem('token');
                    alert('Please login again session expired');
                    navigate('/login');
                    return;
                }
                if (decodedToken.userType !== 'logistics') {
                    alert('You are not logistics provider to view this page login with logistics account to add product');
                    navigate('/login');
                    return;
                }
                setEmail(decodedToken.email);
            } catch (e) {
                console.error('Invalid token', e);
                alert('Please login again session expired');
                navigate('/login');
                localStorage.removeItem('token');
            }
        } else {
            alert('Please login with logistics account to become a provider');
            navigate('/login');
        }
        console.log('Provider registration:', providerForm);
        // Here you would typically send the form data to your backend or smart contract
        try {
            const transaction = await logisticsWithSigner.connect(signer).registerProvider(
                email, providerForm.distancePrice, providerForm.walletAddress)
            const txReceipt = await transaction.wait();
            console.log('Transaction receipt:', txReceipt);
            alert('Transaction successful! provider added.');
        } catch (e) {
            console.log(e);
        }
        setProviderForm({
            emailId: '',
            distancePrice: 0,
            walletAddress: ''
        });
    };

    return (
        <>
            <form
                onSubmit={handleFormSubmit}
                className="max-w-2xl mx-auto space-y-6"
            >
                {/* Price per Km */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Price per Kilometer (in gwei)
                    </label>
                    <input
                        type="number"
                        value={providerForm.distancePrice}
                        onChange={e => {
                            const val = parseFloat(e.target.value);
                            setProviderForm(prev => ({
                                ...prev,
                                distancePrice: isNaN(val) ? 0 : val
                            }));
                        }}
                        className="w-full bg-gray-700 rounded p-2"
                        required
                    />
                </div>

                {/* Wallet Connect */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Wallet Address
                    </label>

                    {providerForm.walletAddress ? (
                        <div className="flex items-center space-x-2">
                            {/* show a truncated address */}
                            <span className="bg-gray-600 px-3 py-2 rounded">
                                {providerForm.walletAddress.slice(0, 6)}…
                                {providerForm.walletAddress.slice(-4)}
                            </span>
                            <button
                                type="button"
                                onClick={connect}
                                className="text-sm underline hover:text-gray-200"
                            >
                                Change
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={connect}
                            className="w-full bg-yellow-500 text-black py-2 rounded hover:bg-yellow-600"
                        >
                            Connect MetaMask
                        </button>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                    Register as Provider
                </button>
            </form>
        </>
    )
}
