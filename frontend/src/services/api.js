export async function createShipment(description) {
  const res = await fetch('/api/create-shipment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description })
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