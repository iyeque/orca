import React, { useState } from 'react';
import { Box, Button, Alert } from '@mui/material';

export default function VisionWidget() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    setError(null);
    setResult(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/vision/count-stock', {
        method: 'POST',
        body: formData,
      });
      setResult(await res.json());
    } catch (e) {
      setError('Failed to count stock');
    }
  };

  return (
    <Box sx={{ my: 4 }}>
      <h2>Inventory Vision</h2>
      <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
      <Button variant="contained" onClick={handleUpload} disabled={!file} sx={{ ml: 2 }}>Count Stock</Button>
      {result && <Alert severity="success" sx={{ mt: 2 }}>Stock Count: {result.stock_count}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
} 