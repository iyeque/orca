from __future__ import annotations

from fastapi import FastAPI, Body, UploadFile, HTTPException, Depends, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from .ai_gateway import predict_delay
from .ai.supplier_suggester import suggest_suppliers
from .ai.nlp.inventory_predictor import predict_runout
from .ipfs_client import pin_json, get_json
from .web3_client import create_shipment, mint_nft
import os
from .oracle import get_weather, get_gps, get_chainlink_weather
from .vision import count_stock_from_image
from .dao import create_proposal, vote, get_proposals, InventoryDAO, ShipmentDAO, PurchaseOrderDAO, UserDAO, SessionLocal
from .schemas import Inventory, InventoryCreate, Shipment, ShipmentCreate, PurchaseOrder, PurchaseOrderCreate, SupplierAnalytics, ErrorResponse, User, UserCreate, Token
from .security import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY, ALGORITHM
import datetime
from datetime import timedelta
import uuid
from typing import List, Dict
from jose import JWTError, jwt
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
from redis import asyncio as aioredis

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize DAOs
inventory_dao = InventoryDAO()
shipment_dao = ShipmentDAO()
purchase_order_dao = PurchaseOrderDAO()
user_dao = UserDAO()

# Rate Limiting Initialization
@app.on_event("startup")
async def startup():
    redis_url = os.environ.get("REDIS_URL", "redis://localhost")
    redis_connection = aioredis.from_url(redis_url, encoding="utf-8", decode_responses=True)
    await FastAPILimiter.init(redis_connection)

# Custom Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content=ErrorResponse(detail=str(exc.errors()), status_code=422).dict(),
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(detail=exc.detail, status_code=exc.status_code).dict(),
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(detail="Internal Server Error", status_code=500).dict(),
    )

# --- Authentication Endpoints ---
@app.post("/register", response_model=User, dependencies=[Depends(RateLimiter(times=5, minutes=1))])  # type: ignore
def register_user(user: UserCreate, db: SessionLocal = Depends(get_db)):# type: ignore
    db_user = user_dao.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    db_user = user_dao.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = user_dao.create_user(db, {"username": user.username, "email": user.email, "hashed_password": hashed_password})
    return new_user

@app.post("/token", response_model=Token, dependencies=[Depends(RateLimiter(times=10, minutes=1))])  # type: ignore
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: SessionLocal = Depends(get_db)):# type: ignore
    user = user_dao.get_user_by_username(db, username=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme), db: SessionLocal = Depends(get_db)):# type: ignore
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = user_dao.get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    return user

# --- Protected Endpoint Example ---
@app.get("/users/me/", response_model=User, dependencies=[Depends(RateLimiter(times=60, minutes=1))])  # type: ignore
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.post("/create-shipment", response_model=Shipment, dependencies=[Depends(RateLimiter(times=30, minutes=1))])  # type: ignore
def create_shipment_api(shipment_create: ShipmentCreate, db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):# type: ignore
    # 1. Pin metadata to IPFS
    ipfs_hash = pin_json(shipment_create.dict())
    # 2. Interact with smart contract (simulate sender for demo)
    sender_pk = os.environ.get('SHIPMENT_SENDER_PK') # TODO: Manage private keys securely (e.g., encrypted secrets, not directly in env vars in production)
    tx = create_shipment(ipfs_hash, sender_pk)
    # 3. Store in DB
    shipment_data = shipment_create.dict()
    shipment_data["ipfs_hash"] = ipfs_hash
    shipment_data["tx"] = tx
    shipment_data["creation_date"] = datetime.datetime.now()
    
    new_shipment = shipment_dao.create(db, shipment_data)
    return new_shipment

@app.post("/mint-nft", dependencies=[Depends(RateLimiter(times=30, minutes=1))])
def mint_nft_api(data: dict = Body(...), current_user: User = Depends(get_current_user)):
    to = data['to']
    sender_pk = os.environ.get('NFT_SENDER_PK') # TODO: Manage private keys securely (e.g., encrypted secrets, not directly in env vars in production)
    tx = mint_nft(to, sender_pk)
    return {"tx": tx}

@app.get("/shipments", response_model=List[Shipment], dependencies=[Depends(RateLimiter(times=60, minutes=1))])  # type: ignore
def list_shipments(db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):# type: ignore
    return shipment_dao.get_all(db)

@app.get("/shipment/{ipfs_hash}", dependencies=[Depends(RateLimiter(times=60, minutes=1))])
def get_shipment(ipfs_hash: str, current_user: User = Depends(get_current_user)):
    # This still fetches from IPFS, not DB
    return get_json(ipfs_hash)

@app.get("/inventory", response_model=List[Inventory], dependencies=[Depends(RateLimiter(times=60, minutes=1))])  # type: ignore
def get_inventory(db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):# type: ignore
    return inventory_dao.get_all(db)

@app.get("/suppliers", dependencies=[Depends(RateLimiter(times=60, minutes=1))])
def get_suppliers(db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):# type: ignore
    inventory_items = inventory_dao.get_all(db)
    return list(set(item.supplier_id for item in inventory_items))

@app.post("/inventory", response_model=Inventory, dependencies=[Depends(RateLimiter(times=30, minutes=1))])  # type: ignore
def add_inventory_item(item: InventoryCreate, db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):# type: ignore
    new_item = inventory_dao.create(db, item.dict())
    return new_item

def mark_shipment_delivered(db: SessionLocal, product_id: str, delivery_quantity: int):# type: ignore
    now = datetime.datetime.now()
    # Find relevant shipments and mark them delivered
    # This logic might need to be more sophisticated in a real app
    shipments_to_update = db.query(shipment_dao.model).filter(
        shipment_dao.model.product_id == product_id,
        shipment_dao.model.delivery_date == None
    ).all()

    for shipment in shipments_to_update:
        shipment.delivery_date = now
        db.add(shipment)
        db.commit()
        db.refresh(shipment)
        return # Mark one shipment as delivered for simplicity

@app.put("/inventory/{product_id}", response_model=Inventory, dependencies=[Depends(RateLimiter(times=30, minutes=1))])  # type: ignore
def update_inventory_item(product_id: str, item_update: dict = Body(...), db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):# type: ignore
    existing_item = inventory_dao.get_by_product_id(db, product_id)
    if not existing_item:
        raise HTTPException(status_code=404, detail="Item not found")

    original_quantity = existing_item.quantity
    
    item_update = {"quantity": item_update["quantity"], "last_updated": datetime.datetime.now()}
    updated_item = inventory_dao.update(db, product_id, item_update)

    # If quantity has increased, mark a shipment as delivered
    if updated_item.quantity > original_quantity:
        delivery_quantity = updated_item.quantity - original_quantity
        mark_shipment_delivered(db, product_id, delivery_quantity)

    return updated_item

@app.get("/inventory/predictions", dependencies=[Depends(RateLimiter(times=60, minutes=1))])  # type: ignore
def get_all_inventory_predictions(db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):# type: ignore
    predictions = {}
    inventory_items = inventory_dao.get_all(db)
    for item in inventory_items:
        prediction = predict_runout(item.quantity, item.daily_consumption_rate)
        predictions[item.product_id] = prediction
    return predictions

@app.post("/inventory/check-reorder", dependencies=[Depends(RateLimiter(times=30, minutes=1))])
def check_reorder_levels(db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):# type: ignore
    created_shipments = []
    inventory_items = inventory_dao.get_all(db)
    for item in inventory_items:
        if item.quantity < item.reorder_threshold:
            shipment_data = {
                "description": f"Automated reorder of {item.default_reorder_quantity} units of {item.product_name} ({item.product_id})",
                "owner": item.supplier_id, # Or a default warehouse owner address
                "product_id": item.product_id,
                "quantity": item.default_reorder_quantity
            }
            # Use the Pydantic model for creation
            shipment_create_model = ShipmentCreate(**shipment_data)
            new_shipment = shipment_dao.create(db, shipment_create_model.dict())
            created_shipments.append(new_shipment)
    return {"message": f"{len(created_shipments)} shipments created.", "shipments": created_shipments}

# --- Purchase Order Endpoints ---

@app.post("/purchase-orders", response_model=PurchaseOrder, dependencies=[Depends(RateLimiter(times=30, minutes=1))])  # type: ignore
def create_purchase_order(po_data: PurchaseOrderCreate, db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):# type: ignore
    po_id = str(uuid.uuid4())
    # Assuming line_items is a list of dicts in the Pydantic model
    total_value = sum(item['quantity'] * item['price_per_unit'] for item in eval(po_data.line_items)) # eval for simplicity, better to parse JSON
    new_po_data = po_data.dict()
    new_po_data["po_id"] = po_id
    new_po_data["status"] = "Pending"
    new_po_data["total_value"] = total_value
    new_po_data["creation_date"] = datetime.datetime.now()
    
    new_po = purchase_order_dao.create(db, new_po_data)
    return new_po

@app.get("/purchase-orders", response_model=List[PurchaseOrder], dependencies=[Depends(RateLimiter(times=60, minutes=1))])  # type: ignore
def get_purchase_orders(db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):# type: ignore
    return purchase_order_dao.get_all(db)

@app.get("/purchase-orders/{po_id}", response_model=PurchaseOrder, dependencies=[Depends(RateLimiter(times=60, minutes=1))])  # type: ignore
def get_purchase_order(po_id: str, db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):# type: ignore
    po = purchase_order_dao.get_by_po_id(db, po_id)
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
    return po

@app.put("/purchase-orders/{po_id}/status", response_model=PurchaseOrder, dependencies=[Depends(RateLimiter(times=30, minutes=1))])  # type: ignore
def update_purchase_order_status(po_id: str, status_update: dict = Body(...), db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):# type: ignore
    po = purchase_order_dao.get_by_po_id(db, po_id)
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
    
    update_data = {"status": status_update["status"]}
    if status_update["status"] == "Approved":
        update_data["approval_date"] = datetime.datetime.now()
    
    updated_po = purchase_order_dao.update(db, po_id, update_data)
    return updated_po

@app.post("/suggest-suppliers", dependencies=[Depends(RateLimiter(times=30, minutes=1))])  # type: ignore
def suggest_suppliers_api(product_ids: List[str] = Body(...), db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):# type: ignore
    inventory_items = inventory_dao.get_all(db) # Pass inventory from DB
    return suggest_suppliers(product_ids, inventory_items)

# --- Analytics & AI Endpoints ---

@app.get("/analytics/supplier/{supplier_id}", response_model=SupplierAnalytics, dependencies=[Depends(RateLimiter(times=60, minutes=1))])  # type: ignore
def get_supplier_analytics(supplier_id: str, db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):# type: ignore
    processing_times = []
    shipments = shipment_dao.get_all(db)
    for shipment in shipments:
        if shipment.owner == supplier_id and shipment.creation_date and shipment.delivery_date:
            try:
                creation = shipment.creation_date
                delivery = shipment.delivery_date
                processing_time = (delivery - creation).total_seconds()
                processing_times.append(processing_time)
            except (TypeError, ValueError):
                # Ignore shipments with invalid date formats
                continue
    
    if not processing_times:
        return {"supplier_id": supplier_id, "average_processing_time_seconds": 0, "shipment_count": 0}

    average_time = sum(processing_times) / len(processing_times)
    return {"supplier_id": supplier_id, "average_processing_time_seconds": average_time, "shipment_count": len(processing_times)}


@app.post("/predict-delay", dependencies=[Depends(RateLimiter(times=30, minutes=1))])  # type: ignore
def predict(data: dict = Body(...), current_user: User = Depends(get_current_user)):# type: ignore
    return predict_delay(data)

@app.get("/oracle/weather", dependencies=[Depends(RateLimiter(times=60, minutes=1))])  # type: ignore
def oracle_weather(location: str, current_user: User = Depends(get_current_user)):# type: ignore
    return get_weather(location)

@app.get("/oracle/gps", dependencies=[Depends(RateLimiter(times=60, minutes=1))])
def oracle_gps(shipment_id: int, current_user: User = Depends(get_current_user)):# type: ignore
    return get_gps(shipment_id)

@app.get("/oracle/chainlink-weather", dependencies=[Depends(RateLimiter(times=60, minutes=1))])
def oracle_chainlink_weather(location: str, current_user: User = Depends(get_current_user)):# type: ignore
    return get_chainlink_weather(location)

@app.post("/vision/count-stock/{product_id}", response_model=Inventory, dependencies=[Depends(RateLimiter(times=30, minutes=1))])  # type: ignore
def vision_count_stock(product_id: str, file: UploadFile, db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):# type: ignore
    vision_result = count_stock_from_image(file)
    count = len(vision_result.get("predictions", [])) 

    existing_item = inventory_dao.get_by_product_id(db, product_id)
    if not existing_item:
        raise HTTPException(status_code=404, detail="Item not found")

    original_quantity = existing_item.quantity
    
    item_update = {"quantity": item_update["quantity"], "last_updated": datetime.datetime.now()}
    updated_item = inventory_dao.update(db, product_id, item_update)

    # If quantity has increased, mark a shipment as delivered
    if updated_item.quantity > original_quantity:
        delivery_quantity = updated_item.quantity - original_quantity
        mark_shipment_delivered(db, product_id, delivery_quantity)

    return updated_item


@app.post("/dao/proposal", dependencies=[Depends(RateLimiter(times=30, minutes=1))])  # type: ignore
def dao__proposal(data: dict = Body(...), current_user: User = Depends(get_current_user)):
    pid = create_proposal(data['title'], data['description'])
    return {'proposal_id': pid}

@app.post("/dao/vote", dependencies=[Depends(RateLimiter(times=30, minutes=1))])
def dao_vote(data: dict = Body(...), current_user: User = Depends(get_current_user)):
    success = vote(data['proposal_id'])
    return {'success': success}

@app.get("/dao/proposals", dependencies=[Depends(RateLimiter(times=60, minutes=1))])
def dao_list_proposals(current_user: User = Depends(get_current_user)):
    return get_proposals()