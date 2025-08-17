from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class InventoryBase(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    reorder_threshold: int
    default_reorder_quantity: int
    daily_consumption_rate: int
    price_per_unit: float
    warehouse_id: str
    supplier_id: str

class InventoryCreate(InventoryBase):
    pass

class Inventory(InventoryBase):
    last_updated: datetime

    class Config:
        orm_mode = True

class ShipmentBase(BaseModel):
    ipfs_hash: str
    tx: str
    description: Optional[str] = None
    owner: Optional[str] = None
    product_id: Optional[str] = None
    quantity: Optional[int] = None

class ShipmentCreate(ShipmentBase):
    pass

class Shipment(ShipmentBase):
    id: int
    creation_date: datetime
    delivery_date: Optional[datetime] = None

    class Config:
        orm_mode = True

class PurchaseOrderBase(BaseModel):
    po_id: str
    status: str
    supplier_id: str
    line_items: str # Storing as string for now, can be a list of dicts later
    total_value: float

class PurchaseOrderCreate(PurchaseOrderBase):
    pass

class PurchaseOrder(PurchaseOrderBase):
    creation_date: datetime
    approval_date: Optional[datetime] = None

    class Config:
        orm_mode = True

class SupplierAnalytics(BaseModel):
    supplier_id: str
    average_processing_time_seconds: float
    shipment_count: int

class ErrorResponse(BaseModel):
    detail: str
    status_code: int

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str
