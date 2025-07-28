import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

export async function connectWallet() {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  return { provider, signer, address };
} 