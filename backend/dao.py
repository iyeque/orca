import os
import uuid
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Database setup
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://user:password@localhost:5432/orca_db")
Base = declarative_base()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Define SQLAlchemy Models
class Inventory(Base):
    __tablename__ = "inventory"
    product_id = Column(String, primary_key=True, index=True)
    product_name = Column(String, index=True)
    quantity = Column(Integer)
    reorder_threshold = Column(Integer)
    default_reorder_quantity = Column(Integer)
    daily_consumption_rate = Column(Integer)
    price_per_unit = Column(Float)
    warehouse_id = Column(String)
    supplier_id = Column(String)
    last_updated = Column(DateTime, default=datetime.utcnow)

class Shipment(Base):
    __tablename__ = "shipments"
    id = Column(Integer, primary_key=True, index=True)
    ipfs_hash = Column(String, unique=True, index=True)
    tx = Column(String)
    creation_date = Column(DateTime, default=datetime.utcnow)
    delivery_date = Column(DateTime, nullable=True)
    description = Column(String)
    owner = Column(String)
    product_id = Column(String)
    quantity = Column(Integer)

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    po_id = Column(String, primary_key=True, index=True)
    status = Column(String)
    supplier_id = Column(String)
    line_items = Column(String) # Store as JSON string for simplicity, or use JSONB type for PostgreSQL
    total_value = Column(Float)
    creation_date = Column(DateTime, default=datetime.utcnow)
    approval_date = Column(DateTime, nullable=True)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

# Create tables
Base.metadata.create_all(bind=engine)

# Existing DAO functions for proposals (unchanged for now)
def create_proposal(title: str, description: str):
    # In-memory store for demo
    proposal_id = str(uuid.uuid4())
    # In a real scenario, this would interact with a blockchain or database
    print(f"Creating proposal: {title} - {description} with ID: {proposal_id}")
    return proposal_id

def vote(proposal_id: str):
    # In a real scenario, this would interact with a blockchain or database
    print(f"Voting on proposal: {proposal_id}")
    return True

def get_proposals():
    # In a real scenario, this would fetch from a blockchain or database
    print("Getting all proposals")
    return []

# DAO classes with SQLAlchemy implementation
class InventoryDAO:
    def get_all(self, db: SessionLocal):
        return db.query(Inventory).all()

    def get_by_product_id(self, db: SessionLocal, product_id: str):
        return db.query(Inventory).filter(Inventory.product_id == product_id).first()

    def create(self, db: SessionLocal, item: dict):
        db_item = Inventory(**item)
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    def update(self, db: SessionLocal, product_id: str, item_update: dict):
        db_item = db.query(Inventory).filter(Inventory.product_id == product_id).first()
        if db_item:
            for key, value in item_update.items():
                setattr(db_item, key, value)
            db.commit()
            db.refresh(db_item)
            return db_item
        return None

    def delete(self, db: SessionLocal, product_id: str):
        db_item = db.query(Inventory).filter(Inventory.product_id == product_id).first()
        if db_item:
            db.delete(db_item)
            db.commit()
            return True
        return False

class ShipmentDAO:
    def get_all(self, db: SessionLocal):
        return db.query(Shipment).all()

    def get_by_id(self, db: SessionLocal, shipment_id: int):
        return db.query(Shipment).filter(Shipment.id == shipment_id).first()

    def create(self, db: SessionLocal, shipment: dict):
        db_shipment = Shipment(**shipment)
        db.add(db_shipment)
        db.commit()
        db.refresh(db_shipment)
        return db_shipment

    def update(self, db: SessionLocal, shipment_id: int, shipment_update: dict):
        db_shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
        if db_shipment:
            for key, value in shipment_update.items():
                setattr(db_shipment, key, value)
            db.commit()
            db.refresh(db_shipment)
            return db_shipment
        return None

    def delete(self, db: SessionLocal, shipment_id: int):
        db_shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
        if db_shipment:
            db.delete(db_shipment)
            db.commit()
            return True
        return False

class PurchaseOrderDAO:
    def get_all(self, db: SessionLocal):
        return db.query(PurchaseOrder).all()

    def get_by_po_id(self, db: SessionLocal, po_id: str):
        return db.query(PurchaseOrder).filter(PurchaseOrder.po_id == po_id).first()

    def create(self, db: SessionLocal, po: dict):
        db_po = PurchaseOrder(**po)
        db.add(db_po)
        db.commit()
        db.refresh(db_po)
        return db_po

    def update(self, db: SessionLocal, po_id: str, po_update: dict):
        db_po = db.query(PurchaseOrder).filter(PurchaseOrder.po_id == po_id).first()
        if db_po:
            for key, value in po_update.items():
                setattr(db_po, key, value)
            db.commit()
            db.refresh(db_po)
            return db_po
        return None

    def delete(self, db: SessionLocal, po_id: str):
        db_po = db.query(PurchaseOrder).filter(PurchaseOrder.po_id == po_id).first()
        if db_po:
            db.delete(db_po)
            db.commit()
            return True
        return False

class UserDAO:
    def get_user_by_username(self, db: SessionLocal, username: str):
        return db.query(User).filter(User.username == username).first()

    def get_user_by_email(self, db: SessionLocal, email: str):
        return db.query(User).filter(User.email == email).first()

    def create_user(self, db: SessionLocal, user: dict):
        db_user = User(**user)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
