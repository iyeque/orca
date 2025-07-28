import React, { useState } from 'react';
import { createShipment, predictDelay } from '../services/api';
import { Button, TextField, CircularProgress, Alert, Box } from '@mui/material';

export default function ShipmentForm({ walletAddress }) {
  const [desc, setDesc] = useState("");
  const [result, setResult] = useState(null);
  const [delay, setDelay] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setDelay(null);
    try {
      const shipment = await createShipment({ description: desc, owner: walletAddress });
      setResult(shipment);
      setDesc("");
      // Predict delay
      const pred = await predictDelay({ features: [Math.random(), Math.random(), Math.random()] });
      setDelay(pred.delay_probability);
    } catch (e) {
      setError(e.message || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ my: 4 }}>
      <TextField
        label="Shipment description"
        value={desc}
        onChange={e => setDesc(e.target.value)}
        variant="outlined"
        sx={{ mr: 2, width: 300 }}
      />
      <Button variant="contained" color="primary" onClick={handleCreate} disabled={loading || !desc}>
        {loading ? <CircularProgress size={24} /> : 'Create Shipment'}
      </Button>
      {result && <Alert severity="success" sx={{ mt: 2 }}>Shipment Created! IPFS: {result.ipfs_hash}</Alert>}
      {delay !== null && <Alert severity="info" sx={{ mt: 2 }}>Predicted Delay Probability: {delay}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
} 