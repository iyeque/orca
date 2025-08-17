import React, { useState, useEffect } from 'react';
import { getSuppliers, getSupplierAnalytics } from '../services/api';
import { 
    Select, 
    MenuItem, 
    FormControl, 
    InputLabel, 
    Card, 
    CardContent, 
    Typography, 
    Box 
} from '@mui/material';

export default function SupplierAnalytics() {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchSuppliers() {
      const supplierList = await getSuppliers();
      setSuppliers(supplierList);
    }
    fetchSuppliers();
  }, []);

  const handleSupplierChange = async (event) => {
    const supplierId = event.target.value;
    setSelectedSupplier(supplierId);
    if (supplierId) {
      setLoading(true);
      const data = await getSupplierAnalytics(supplierId);
      setAnalytics(data);
      setLoading(false);
    }
  };

  return (
    <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
            Supplier Analytics
        </Typography>
        <FormControl fullWidth>
            <InputLabel id="supplier-select-label">Select Supplier</InputLabel>
            <Select
            labelId="supplier-select-label"
            id="supplier-select"
            value={selectedSupplier}
            label="Select Supplier"
            onChange={handleSupplierChange}
            >
            {suppliers.map(supplier => (
                <MenuItem key={supplier} value={supplier}>{supplier}</MenuItem>
            ))}
            </Select>
        </FormControl>

        {loading && <p>Loading analytics...</p>}

        {analytics && selectedSupplier && (
            <Card sx={{ mt: 2 }}>
                <CardContent>
                    <Typography variant="h6">Analytics for {selectedSupplier}</Typography>
                    <Typography>Average Processing Time: {analytics.average_processing_time_seconds.toFixed(2)} seconds</Typography>
                    <Typography>Number of Shipments Analyzed: {analytics.shipment_count}</Typography>
                </CardContent>
            </Card>
        )}
    </Box>
  );
}
