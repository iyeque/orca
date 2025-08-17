export async function createShipment(description) {
  const res = await fetch('/api/create-shipment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(description)
  });
  return res.json();
}

export async function getShipments() {
  const res = await fetch('/api/shipments');
  return res.json();
}

export async function predictDelay(shipment) {
  const res = await fetch('/api/predict-delay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shipment)
  });
  return res.json();
}

export async function getInventory() {
  const res = await fetch('/api/inventory');
  return res.json();
}

export async function getAllInventoryPredictions() {
  const res = await fetch('/api/inventory/predictions');
  return res.json();
}

export async function checkReorderLevels() {
  const res = await fetch('/api/inventory/check-reorder', {
    method: 'POST'
  });
  return res.json();
}

export async function getSuppliers() {
    const res = await fetch('/api/suppliers');
    return res.json();
}

export async function getSupplierAnalytics(supplierId) {
  const res = await fetch(`/api/analytics/supplier/${supplierId}`);
  return res.json();
}

// --- Purchase Order API Functions ---

export async function createPurchaseOrder(poData) {
    const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poData)
    });
    return res.json();
}

export async function getPurchaseOrders() {
    const res = await fetch('/api/purchase-orders');
    return res.json();
}

export async function updatePurchaseOrderStatus(poId, status) {
    const res = await fetch(`/api/purchase-orders/${poId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    return res.json();
}

export async function suggestSuppliers(productIds) {
    const res = await fetch('/api/suggest-suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productIds)
    });
    return res.json();
} 