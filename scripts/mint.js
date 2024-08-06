//const hre = require("hardhat");
const {
  ethers,
  network,
} = require("hardhat");

//const HttpNetworkConfig = require("hardhat/types");

const {
  encryptDataField,
  decryptNodeResponse,
} = require("@swisstronik/swisstronik.js");


const sendShieldedTransaction = async (signer, destination, data, value) => {

  const rpcLink = network.config.url;

  const [encryptedData] = await encryptDataField(rpcLink, data);

  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
};

async function main() {

  const contractAddress = "0x3B59E530174847466E0a67c1A28a9CFE1ff8C442";

  const [signer] = await ethers.getSigners();

  const contractFactory = await ethers.getContractFactory("TestNFT");
  const contract = contractFactory.attach(contractAddress);

  const functionName = "mintNFT";
  const recipientAddress = signer.address;
  const mintToken = await sendShieldedTransaction(
    signer,
    contractAddress,
    contract.interface.encodeFunctionData(functionName, [recipientAddress]),
    0
  );

  await mintToken.wait();

  console.log("Mint Transaction Hash: ", mintToken.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
