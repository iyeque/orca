import React, { useState, useEffect } from 'react';
import { getInventory, getAllInventoryPredictions, checkReorderLevels } from '../services/api';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Typography, 
    Box,
    CircularProgress,
    Button,
    Alert
} from '@mui/material';

export default function InventoryDashboard() {
  const [inventory, setInventory] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reorderStatus, setReorderStatus] = useState(null);

  async function loadData() {
    try {
      setLoading(true);
      const [inventoryData, predictionsData] = await Promise.all([
        getInventory(),
        getAllInventoryPredictions()
      ]);
      setInventory(inventoryData);
      setPredictions(predictionsData);
    } catch (e) {
      setError(e.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleReorderCheck = async () => {
    setReorderStatus({ message: 'Checking levels and creating shipments...', severity: 'info' });
    try {
      const result = await checkReorderLevels();
      setReorderStatus({ message: result.message, severity: 'success' });
      // Refresh inventory and predictions
      loadData();
    } catch (e) {
      setReorderStatus({ message: e.message || 'Failed to check reorder levels', severity: 'error' });
    }
  };

  if (loading) return <p>Loading inventory...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Box sx={{ my: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Inventory Dashboard
        </Typography>
        <Button variant="contained" onClick={handleReorderCheck}>
          Check Reorder Levels
        </Button>
      </Box>
      {reorderStatus && <Alert severity={reorderStatus.severity} sx={{ mt: 2 }}>{reorderStatus.message}</Alert>}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Product ID</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Reorder Threshold</TableCell>
              <TableCell>Warehouse</TableCell>
              <TableCell>Supplier ID</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Predicted Run-out Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.product_id}>
                <TableCell component="th" scope="row">
                  {item.product_id}
                </TableCell>
                <TableCell>{item.product_name}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">{item.reorder_threshold}</TableCell>
                <TableCell>{item.warehouse_id}</TableCell>
                <TableCell>{item.supplier_id}</TableCell>
                <TableCell>{new Date(item.last_updated).toLocaleString()}</TableCell>
                <TableCell>
                  {predictions[item.product_id] ? 
                    (new Date(predictions[item.product_id]).toLocaleDateString()) : 
                    'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
