import React, { useState } from 'react';
import WalletConnect from '../src/components/WalletConnect';
import ShipmentForm from '../src/components/ShipmentForm';
import ShipmentList from '../src/components/ShipmentList';
import OracleWidget from '../src/components/OracleWidget';
import VisionWidget from '../src/components/VisionWidget';
import DAOWidget from '../src/components/DAOWidget';
import AnimatedCard from '../src/components/AnimatedCard';

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