import React, { useState, useEffect } from 'react';
import { getSuppliers, getInventory, createPurchaseOrder, suggestSuppliers } from '../services/api';
import { 
    Button, 
    Select, 
    MenuItem, 
    FormControl, 
    InputLabel, 
    TextField, 
    Box, 
    Typography,
    IconButton,
    Alert,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

export default function PurchaseOrderForm({ onPoCreated }) {
  const [suppliers, setSuppliers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [lineItems, setLineItems] = useState([{ product_id: '', quantity: 1 }]);
  const [status, setStatus] = useState(null);
  const [suggestedSuppliers, setSuggestedSuppliers] = useState([]);

  useEffect(() => {
    async function loadData() {
      const [supplierData, inventoryData] = await Promise.all([
        getSuppliers(),
        getInventory()
      ]);
      setSuppliers(supplierData);
      setInventory(inventoryData);
    }
    loadData();
  }, []);

  useEffect(() => {
    async function getSuggestions() {
      const productIds = lineItems.map(item => item.product_id).filter(id => id !== '');
      if (productIds.length > 0) {
        const suggestions = await suggestSuppliers(productIds);
        setSuggestedSuppliers(suggestions);
      } else {
        setSuggestedSuppliers([]);
      }
    }
    getSuggestions();
  }, [lineItems]);

  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...lineItems];
    newLineItems[index][field] = value;
    setLineItems(newLineItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { product_id: '', quantity: 1 }]);
  };

  const removeLineItem = (index) => {
    const newLineItems = [...lineItems];
    newLineItems.splice(index, 1);
    setLineItems(newLineItems);
  };

  const handleSubmit = async () => {
    setStatus(null);
    const poData = {
      supplier_id: selectedSupplier,
      line_items: lineItems.map(item => ({
        ...item,
        price_per_unit: inventory.find(invItem => invItem.product_id === item.product_id)?.price_per_unit || 0
      }))
    };

    try {
      const newPo = await createPurchaseOrder(poData);
      setStatus({ message: `Purchase Order ${newPo.po_id} created successfully!`, severity: 'success' });
      // Reset form
      setSelectedSupplier('');
      setLineItems([{ product_id: '', quantity: 1 }]);
      if (onPoCreated) {
        onPoCreated();
      }
    } catch (e) {
      setStatus({ message: e.message || 'Failed to create Purchase Order', severity: 'error' });
    }
  };

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" gutterBottom>
        Create Purchase Order
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Supplier</InputLabel>
        <Select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)} label="Supplier">
          {suppliers.map(supplier => (
            <MenuItem key={supplier} value={supplier}>{supplier}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {suggestedSuppliers.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Suggested Suppliers:</Typography>
          <List>
            {suggestedSuppliers.map(supplier => (
              <ListItem key={supplier} disablePadding>
                <ListItemText primary={supplier} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {lineItems.map((item, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FormControl sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel>Product</InputLabel>
            <Select 
              value={item.product_id} 
              onChange={e => handleLineItemChange(index, 'product_id', e.target.value)}
              label="Product"
            >
              {inventory.map(invItem => (
                <MenuItem key={invItem.product_id} value={invItem.product_id}>
                  {invItem.product_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            type="number"
            label="Quantity"
            value={item.quantity}
            onChange={e => handleLineItemChange(index, 'quantity', parseInt(e.target.value, 10))}
            sx={{ width: 100 }}
          />
          <IconButton onClick={() => removeLineItem(index)}>
            <RemoveCircleIcon />
          </IconButton>
        </Box>
      ))}

      <Button startIcon={<AddCircleIcon />} onClick={addLineItem} sx={{ mb: 2 }}>
        Add Line Item
      </Button>

      <Button variant="contained" onClick={handleSubmit} disabled={!selectedSupplier || lineItems.some(item => !item.product_id)}>
        Create PO
      </Button>

      {status && <Alert severity={status.severity} sx={{ mt: 2 }}>{status.message}</Alert>}
    </Box>
  );
}
