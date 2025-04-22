const hre = require("hardhat");

async function main() {
    const ProductRegistry = await hre.ethers.getContractFactory("ProductRegistry");
    const productRegistry = await ProductRegistry.deploy();
    await productRegistry.waitForDeployment();
    console.log("ProductRegistry deployed to:",await productRegistry.getAddress());

    const Escrow = await hre.ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment();
    console.log("Escrow deployed to:",await escrow.getAddress());

    const Logistics = await hre.ethers.getContractFactory("Logistics");
    const logistics = await Logistics.deploy();
    await logistics.waitForDeployment();
    console.log("Logistics deployed to:",await logistics.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
