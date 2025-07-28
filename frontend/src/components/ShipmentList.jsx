import React, { useEffect, useState } from 'react';
import { Box, List, ListItem, ListItemText, Button, Dialog, DialogTitle, DialogContent, CircularProgress, Alert } from '@mui/material';

export default function ShipmentList() {
  const [shipments, setShipments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/shipments')
      .then(res => res.json())
      .then(setShipments)
      .catch(e => setError('Failed to fetch shipments'))
      .finally(() => setLoading(false));
  }, []);

  const fetchMetadata = async (ipfs_hash) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/shipment/${ipfs_hash}`);
      setMetadata(await res.json());
      setSelected(ipfs_hash);
    } catch (e) {
      setError('Failed to fetch metadata');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ my: 4 }}>
      <h2>Shipments</h2>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      <List>
        {shipments.map(s => (
          <ListItem key={s.id} secondaryAction={
            <Button variant="outlined" onClick={() => fetchMetadata(s.ipfs_hash)}>
              View Metadata
            </Button>
          }>
            <ListItemText primary={s.description} secondary={`IPFS: ${s.ipfs_hash}`} />
          </ListItem>
        ))}
      </List>
      <Dialog open={!!metadata} onClose={() => setMetadata(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Metadata for {selected}</DialogTitle>
        <DialogContent>
          <pre>{JSON.stringify(metadata, null, 2)}</pre>
        </DialogContent>
      </Dialog>
    </Box>
  );
} 