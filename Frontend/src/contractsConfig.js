import ProductRegistry from "./../../Backend/SmartContracts/artifacts/contracts/ProductRegistry.sol/ProductRegistry.json";
import Escrow from "./../../Backend/SmartContracts/artifacts/contracts/Escrow.sol/Escrow.json";
import Logistics from "./../../Backend/SmartContracts/artifacts/contracts/Logistics.sol/Logistics.json";

export const CONTRACT_ADDRESSES = {
    ProductRegistry: "0x98a6b6F516B05A95F248240DB9Eb84CD90fD97E7",
    Escrow: "0x389078E7D1982b4b578CEcf8FfcE00E065bEEDFB",
    Logistics: "0x5d75E5fF4Fa14B822A5fE385D9bcE416579ab4C9",
};

export const CONTRACT_ABIS = {
    ProductRegistry: ProductRegistry.abi,
    Escrow: Escrow.abi,
    Logistics: Logistics.abi,
};