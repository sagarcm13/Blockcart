import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ABIS, CONTRACT_ADDRESSES } from "../contractsConfig";

export const useContracts = () => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contracts, setContracts] = useState({});

    // Step 1: initialize with read-only provider on mount
    useEffect(() => {
        const init = async () => {
            const defaultProvider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/7WWgQnMVloDEMzPrkA0s1wTDw_juQ8T1");
            setProvider(defaultProvider);

            const productRegistry = new ethers.Contract(
                CONTRACT_ADDRESSES.ProductRegistry,
                CONTRACT_ABIS.ProductRegistry,
                defaultProvider
            );
            const escrow = new ethers.Contract(
                CONTRACT_ADDRESSES.Escrow,
                CONTRACT_ABIS.Escrow,
                defaultProvider
            );
            const logistics = new ethers.Contract(
                CONTRACT_ADDRESSES.Logistics,
                CONTRACT_ABIS.Logistics,
                defaultProvider
            );

            setContracts({ productRegistry, escrow, logistics });
        };

        init();
    }, []);

    // Step 2: connect wallet (optional, when user wants to interact)
    const connect = async () => {
        if (!window.ethereum) {
            alert("Please install MetaMask!");
            return;
        }

        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        await ethProvider.send("eth_requestAccounts", []);
        const signer = await ethProvider.getSigner();

        const productRegistry = new ethers.Contract(
            CONTRACT_ADDRESSES.ProductRegistry,
            CONTRACT_ABIS.ProductRegistry,
            signer
        );
        const escrow = new ethers.Contract(
            CONTRACT_ADDRESSES.Escrow,
            CONTRACT_ABIS.Escrow,
            signer
        );
        const logistics = new ethers.Contract(
            CONTRACT_ADDRESSES.Logistics,
            CONTRACT_ABIS.Logistics,
            signer
        );

        setProvider(ethProvider);
        setSigner(signer);
        setContracts({ productRegistry, escrow, logistics });
    };

    return {
        provider,
        signer,
        ...contracts,
        connect,
    };
};
