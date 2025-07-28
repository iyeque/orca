import React, { useState } from 'react';
import WalletConnect from '../components/WalletConnect';
import ShipmentForm from '../components/ShipmentForm';
import ShipmentList from '../components/ShipmentList';
import OracleWidget from '../components/OracleWidget';
import VisionWidget from '../components/VisionWidget';
import DAOWidget from '../components/DAOWidget';
import AnimatedCard from '../components/AnimatedCard';

export default function Dashboard() {
  const [wallet, setWallet] = useState(null);

  return (
    <div style={{padding: 32, maxWidth: 900, margin: '0 auto'}}>
      <AnimatedCard>
        <h1>ORCA SCM Dashboard</h1>
        <WalletConnect onConnect={setWallet} />
      </AnimatedCard>
      {wallet && (
        <AnimatedCard>
          <ShipmentForm walletAddress={wallet} />
        </AnimatedCard>
      )}
      <AnimatedCard>
        <ShipmentList />
      </AnimatedCard>
      <AnimatedCard>
        <OracleWidget />
      </AnimatedCard>
      <AnimatedCard>
        <VisionWidget />
      </AnimatedCard>
      <AnimatedCard>
        <DAOWidget />
      </AnimatedCard>
    </div>
  );
} 