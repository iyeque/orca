import React, { useState, useEffect } from 'react';
import { getPurchaseOrders, updatePurchaseOrderStatus } from '../services/api';
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
    Button,
    Chip
} from '@mui/material';

export default function PurchaseOrderDashboard({ refreshKey }) {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadPurchaseOrders() {
    setLoading(true);
    const data = await getPurchaseOrders();
    setPurchaseOrders(data);
    setLoading(false);
  }

  useEffect(() => {
    loadPurchaseOrders();
  }, [refreshKey]);

  const handleUpdateStatus = async (poId, status) => {
    await updatePurchaseOrderStatus(poId, status);
    loadPurchaseOrders();
  };

  const getStatusChip = (status) => {
    let color = 'default';
    if (status === 'Approved') color = 'success';
    if (status === 'Rejected') color = 'error';
    return <Chip label={status} color={color} />;
  };

  if (loading) return <p>Loading purchase orders...</p>;

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" gutterBottom>
        Purchase Order Dashboard
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="purchase order table">
          <TableHead>
            <TableRow>
              <TableCell>PO ID</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell align="right">Total Value</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Creation Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchaseOrders.map((po) => (
              <TableRow key={po.po_id}>
                <TableCell>{po.po_id}</TableCell>
                <TableCell>{po.supplier_id}</TableCell>
                <TableCell align="right">${po.total_value.toFixed(2)}</TableCell>
                <TableCell>{getStatusChip(po.status)}</TableCell>
                <TableCell>{new Date(po.creation_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {po.status === 'Pending' && (
                    <Box>
                      <Button size="small" variant="contained" color="success" sx={{ mr: 1 }} onClick={() => handleUpdateStatus(po.po_id, 'Approved')}>
                        Approve
                      </Button>
                      <Button size="small" variant="contained" color="error" onClick={() => handleUpdateStatus(po.po_id, 'Rejected')}>
                        Reject
                      </Button>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
