import React, { useState } from 'react';
import { connectWallet } from '../services/wallet';

export default function WalletConnect({ onConnect }) {
  const [address, setAddress] = useState(null);

  const handleConnect = async () => {
    const { address } = await connectWallet();
    setAddress(address);
    if (onConnect) onConnect(address);
  };

  return (
    <div>
      {address ? (
        <span>Connected: {address}</span>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
} 