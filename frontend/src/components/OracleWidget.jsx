import React, { useState } from 'react';
import { Box, Button, TextField, Alert } from '@mui/material';

export default function OracleWidget() {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [shipmentId, setShipmentId] = useState('');
  const [gps, setGps] = useState(null);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    setError(null);
    try {
      const res = await fetch(`/api/oracle/weather?location=${location}`);
      setWeather(await res.json());
    } catch (e) {
      setError('Failed to fetch weather');
    }
  };

  const fetchGps = async () => {
    setError(null);
    try {
      const res = await fetch(`/api/oracle/gps?shipment_id=${shipmentId}`);
      setGps(await res.json());
    } catch (e) {
      setError('Failed to fetch GPS');
    }
  };

  return (
    <Box sx={{ my: 4 }}>
      <h2>Oracle Data</h2>
      <Box sx={{ mb: 2 }}>
        <TextField label="Location" value={location} onChange={e => setLocation(e.target.value)} sx={{ mr: 2 }} />
        <Button variant="outlined" onClick={fetchWeather}>Get Weather</Button>
        {weather && <Alert severity="info" sx={{ mt: 2 }}>{JSON.stringify(weather)}</Alert>}
      </Box>
      <Box>
        <TextField label="Shipment ID" value={shipmentId} onChange={e => setShipmentId(e.target.value)} sx={{ mr: 2 }} />
        <Button variant="outlined" onClick={fetchGps}>Get GPS</Button>
        {gps && <Alert severity="info" sx={{ mt: 2 }}>{JSON.stringify(gps)}</Alert>}
      </Box>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
} 