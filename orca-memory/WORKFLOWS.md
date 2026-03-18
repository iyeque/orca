# Orca SCM Platform - System Workflows

## Overview

This document describes the end-to-end data flows and business processes within the Orca platform, illustrating how different components interact. It covers user journeys from UI interactions down to blockchain/IPFS transactions.

---

## Workflow 1: Onboarding & Setup

### 1.1 First-Time Setup (Developer/Admin)

**Goal:** Get the platform running locally or in production.

1. Clone repository and navigate to root
2. Copy `.env.example` → `.env` and fill in:
   - API keys: WEATHER_API_KEY, ROBOFLOW_API_KEY, PINATA_JWT, etc.
   - Blockchain: ETH_RPC_URL, SHIPMENT_SENDER_PK, NFT_SENDER_PK
   - Database: DATABASE_URL, REDIS_URL
   - Security: SECRET_KEY, ALGORITHM
3. Run `docker-compose up --build -d` to start:
   - PostgreSQL (db)
   - Redis
   - Backend (FastAPI)
   - Frontend (Next.js)
   - Ganache blockchain
   - IPFS node
4. Deploy smart contracts:
   - `cd web3 && npm install && npx hardhat compile`
   - `npx hardhat run scripts/deploy.js --network localhost`
   - `npx hardhat run scripts/export_abi_and_address.js`
5. Access frontend at http://localhost:3000, backend API docs at http://localhost:8000/docs

---

## Workflow 2: User Registration & Authentication

### 2.1 Register New User

**Sequence:**

1. **Frontend:** User fills registration form (username, email, password) → POST `/api/register`
2. **Backend:**
   - Receive `UserCreate` payload
   - Check if username/email already exists
   - Hash password with `get_password_hash()` (bcrypt)
   - Create `User` record via `UserDAO.create()`
   - Return `User` object (id, username, email, is_active)
3. **Frontend:** Confirmation message; redirect to login

### 2.2 Login & Obtain JWT

**Sequence:**

1. **Frontend:** User submits login form (username, password) → POST `/api/token` (OAuth2 Password Flow)
2. **Backend:**
   - Retrieve user by username via `UserDAO`
   - Verify password with `verify_password()`
   - If valid, create JWT with `create_access_token()` (expiry 30 min)
   - Return `{access_token, token_type="bearer"}`
3. **Frontend:** Store token (in localStorage/sessionStorage) and include in Authorization header for subsequent requests: `Bearer <token>`
4. **Middleware:** All protected endpoints use `Depends(get_current_user)` to validate token and load user

---

## Workflow 3: Shipment Creation

### 3.1 Create Shipment with IPFS + Blockchain

**Sequence:**

1. **Frontend:** User fills ShipmentForm (description, owner, product_id, quantity) → POST `/api/create-shipment`
2. **Backend:**
   - `create_shipment_api()` receives `ShipmentCreate` data
   - **Step A: Pin metadata to IPFS**
     - Call `pin_json(shipment_create.dict())` → returns IPFS hash (CID)
   - **Step B: Blockchain transaction**
     - Retrieve `SHIPMENT_SENDER_PK` from environment
     - Call `create_shipment(ipfs_hash, sender_pk)`:
       - Load ShipmentTracker contract from ABI + address
       - Build transaction: `createShipment(description)`
       - Note: Transaction NOT signed/sent in current code (returns raw tx object)
   - **Step C: Persist to PostgreSQL**
     - Build `shipment_data` dict including:
       - All fields from ShipmentCreate
       - `ipfs_hash` from IPFS
       - `tx` from blockchain (raw transaction object/string)
       - `creation_date` = now
     - Call `shipment_dao.create(db, shipment_data)` → creates Shipment record
   - Return created Shipment object (with id from DB, dates, etc.)
3. **Frontend:** Display success with shipment details, show IPFS hash and tx reference

**Data Flow:**

```
User Input → API payload → Pydantic validation → IPFS (Pinata) → Blockchain (tx build) → PostgreSQL → Response
```

**Note:** The current implementation does not actually sign and send the transaction; it just builds it. This is likely for demo purposes - in production, you'd sign with private key and send via RPC.

---

## Workflow 4: Inventory Management & Vision

### 4.1 Manual Inventory Addition

**Sequence:**

1. **Frontend:** User submits form with product details → POST `/api/inventory`
2. **Backend:**
   - Validate `InventoryCreate`
   - Call `inventory_dao.create(db, item.dict())`
   - Return created Inventory item
3. **Frontend:** Refresh inventory list

### 4.2 Inventory Update from Vision (Image Upload)

**Sequence:**

1. **Frontend:** In VisionWidget, select product_id, upload image → POST `/api/vision/count-stock/{product_id}`
2. **Backend:**
   - Retrieve Roboflow credentials (API key, model ID, version)
   - Call `count_stock_from_image(file)`:
     - Initialize Roboflow client
     - Perform model.predict(image_bytes)
     - Return prediction JSON (list of detections)
   - Count `len(predictions)` as detected items
   - Fetch existing inventory item via `inventory_dao.get_by_product_id(db, product_id)`
   - Prepare `item_update = {"quantity": count, "last_updated": now}`
   - Call `inventory_dao.update(db, product_id, item_update)`
   - If new quantity > original quantity → call `mark_shipment_delivered()` to partially fulfill a pending shipment
   - Return updated Inventory item
3. **Frontend:** Refresh inventory dashboard with new quantity

### 4.3 Automated Reorder Check

**Sequence:**

1. **Frontend:** User clicks "Check Reorder Levels" → POST `/api/inventory/check-reorder`
2. **Backend:**
   - Fetch all inventory items
   - For each item where `quantity < reorder_threshold`:
     - Create `shipment_data` with description including product info
     - Use `ShipmentCreate` Pydantic model
     - Call `shipment_dao.create(db, shipment_data.dict())`
     - **Note:** This creates a shipment record in the database but does NOT call IPFS or blockchain! (Potential bug/placeholder)
   - Return message with count of created shipments and list (maybe truncated)
3. **Frontend:** Show success message; optionally refresh inventory

**Improvement Needed:** The automated reorder should likely also trigger IPFS pinning and blockchain transaction, just like manual shipment creation.

---

## Workflow 5: Predictive Analytics

### 5.1 Run-out Predictions for All Products

**Sequence:**

1. **Frontend:** On dashboard load, call GET `/api/inventory/predictions`
2. **Backend:**
   - Fetch all inventory items
   - For each item:
     - Call `predict_runout(item.quantity, item.daily_consumption_rate)`
     - This returns dict with `days_until_runout`, `predicted_runout_date`, `status`
   - Assemble into dict keyed by `product_id`
3. **Frontend:** Display predicted run-out date in inventory table

### 5.2 Delay Prediction for a Shipment

**Sequence:**

1. **Frontend:** POST `/api/predict-delay` with JSON body containing `features` array (numeric)
2. **Backend:**
   - Call `predict_delay(data)` from `ai_gateway.py`
   - Load Isolation Forest model (cached or from disk)
   - Run `model.decision_function()` and convert to probability
   - Return `{delay_probability: float}`
3. **Frontend:** Show risk indicator (e.g., high/medium/low)

**Note:** The current UI for delay prediction is not obvious; likely in ShipmentList or details view.

---

## Workflow 6: Purchase Order Management

### 6.1 Create Purchase Order

**Sequence:**

1. **Frontend:** User fills PO form (supplier_id, line_items JSON, etc.) → POST `/api/purchase-orders`
2. **Backend:**
   - Receive `PurchaseOrderCreate`
   - Generate `po_id = str(uuid.uuid4())`
   - Compute `total_value = sum(item.quantity * item.price_per_unit for each line item)`
   - Set `status = "Pending"`, `creation_date = now`
   - Call `purchase_order_dao.create(db, po_data)`
   - Return created PO
3. **Frontend:** Show confirmation, add to PO list

### 6.2 View Purchase Orders

**Sequence:**

1. **Frontend:** GET `/api/purchase-orders`
2. **Backend:** `purchase_order_dao.get_all(db)` → list of all POs
3. **Frontend:** Render table with status badges

### 6.3 Update PO Status (Approval Workflow)

**Sequence:**

1. **Frontend:** Approver selects PO, clicks "Approve" → PUT `/api/purchase-orders/{po_id}/status` with `{status: "Approved"}`
2. **Backend:**
   - Fetch PO by `po_id`
   - Update `status` field
   - If status == "Approved", set `approval_date = now`
   - Save via `purchase_order_dao.update()`
   - Return updated PO
3. **Frontend:** Reflect new status; possibly trigger downstream action (e.g., create shipment)

**Note:** The workflow is basic; no multi-level routing, notifications, or audit trail beyond dates.

---

## Workflow 7: Supplier Analytics

**Sequence:**

1. **Frontend:** User views supplier analytics page → calls GET `/api/analytics/supplier/{supplier_id}` (or list view multiple calls)
2. **Backend:**
   - Fetch all shipments
   - Filter shipments where `owner == supplier_id` and both `creation_date` and `delivery_date` are set
   - Compute processing time = `delivery_date - creation_date` in seconds for each
   - Calculate average
   - Return `{supplier_id, average_processing_time_seconds, shipment_count}`
3. **Frontend:** Display metrics in SupplierAnalytics component (maybe bar chart)

---

## Workflow 8: Supplier Suggestion Engine

**Sequence:**

1. **Frontend:** For a set of product IDs (from PO or manual selection) → POST `/api/suggest-suppliers` with `[product_ids]`
2. **Backend:**
   - Fetch all inventory items
   - Find all `supplier_id` values for items whose `product_id` is in the requested list
   - Return unique supplier IDs
3. **Frontend:** Show suggested suppliers; user can select to create PO

**Improvement Needed:** This is a simple lookup. Real suggestion should incorporate supplier performance metrics, price, reliability, etc.

---

## Workflow 9: Weather & Oracle Integration

### 9.1 Weather Lookup

**Sequence:**

1. **Frontend:** In OracleWidget, enter location → GET `/api/oracle/weather?location={city}`
2. **Backend:**
   - If WEATHER_API_KEY set:
     - Build request to OpenWeatherMap API
     - Parse response → `{location, temperature, condition}`
   - Else: Return random mock data
   - Return JSON
3. **Frontend:** Display weather info

### 9.2 GPS Lookup

**Sequence:**

1. **Frontend:** GET `/api/oracle/gps?shipment_id={id}`
2. **Backend:** Simulate random coordinates `{lat, lon}`
3. **Frontend:** Show on map (if integrated) or raw coords

### 9.3 Chainlink Weather

**Sequence:** Similar to weather, but static placeholder value.

---

## Workflow 10: DAO Governance

### 10.1 Create Proposal

1. **Frontend:** In DAOWidget, enter title, description → POST `/dao/proposal`
2. **Backend:** Call `create_proposal()` (currently in-memory/log only)
3. **Returns:** `{proposal_id}` (UUID)

### 10.2 Vote on Proposal

1. **Frontend:** Select proposal ID, click vote → POST `/dao/vote`
2. **Backend:** Call `vote(proposal_id)` (logs only)
3. **Returns:** `{success: true}`

### 10.3 List Proposals

1. **Frontend:** GET `/dao/proposals`
2. **Backend:** Call `get_proposals()` (returns empty list)
3. **Frontend:** Show no proposals

**Note:** DAO is not integrated with smart contracts or database. It's a placeholder/logic shell.

---

## Workflow 11: NFT Minting

**Sequence:**

1. **Frontend:** Some UI to mint NFT (maybe in WalletConnect or shipment details) → POST `/api/mint-nft` with `{to: address}`
2. **Backend:**
   - Retrieve `NFT_SENDER_PK` from env
   - Build transaction: `nft_contract.functions.mint(to)`
   - Return `{tx}` (raw transaction)
3. **Frontend:** Display transaction; user may need to sign/send via wallet

**Note:** Like shipments, the transaction is built but not signed/sent by server due to private key management concerns.

---

## Workflow 12: Error Handling & Rate Limiting

### Rate Limiting

- Initialized on startup with Redis connection
- Applied per-endpoint via `dependencies=[Depends(RateLimiter(times=N, minutes=M))]`
- Default: varies by endpoint (e.g., 5/min for register, 60/min for read-only)
- When limit exceeded, returns 429 Too Many Requests

### Exception Handling

- `RequestValidationError` → 422 with detail from Pydantic
- `HTTPException` → propagated with status code and detail
- Generic exceptions → 500 with generic message

---

## Workflow 13: Data Persistence Lifecycle

### Shipment Record Lifecycle

1. **Created:** Via `/create-shipment` (or `/inventory/check-reorder` creates without blockchain)
   - DB: `Shipment` row with `ipfs_hash`, `tx`, `delivery_date=NULL`
   - IPFS: Metadata pinned (immutable)
   - Blockchain: Transaction built but maybe not mined

2. **Delivered:** When inventory update indicates goods arrived → `mark_shipment_delivered()`
   - DB: `delivery_date` set to now
   - Chain: Ideally `markDelivered(id)` called on contract (not implemented)

### Inventory Lifecycle

1. **Creation:** `/inventory` POST
2. **Updates:**
   - Manual via `/inventory/{product_id}` PUT
   - Automated via vision endpoint
   - Automated via reorder check (creates shipments, not inventory updates)
3. **Soft delete:** Not implemented

### PO Lifecycle

1. **Created:** status="Pending"
2. **Approved/Rejected:** via `/purchase-orders/{po_id}/status` PUT
3. **Fulfillment:** Not directly linked; shipments can be created manually or automatically referenced

---

## Data Consistency Considerations

- **Shipment DB vs Blockchain:** DB record may exist even if blockchain tx not confirmed. There's no event listening to confirm transaction mined.
- **IPFS vs DB:** IPFS hash stored in DB; if Pinata goes down, new shipments fail. Old data remains retrievable via gateway.
- **Concurrent Reorders:** `/check-reorder` does not lock inventory items; race condition possible if called concurrently.
- **Vision vs Quantity:** Vision count overwrites current quantity, not additive. If user manually adjusted after vision, could lose data.

---

## Security Flows

### Authentication

1. User obtains JWT via `/token`
2. JWT included in `Authorization: Bearer <token>` header
3. Backend verifies signature with SECRET_KEY and algorithm (HS256)
4. Token subject → username → user loaded from DB
5. User object injected into endpoint as `current_user`

### Rate Limiting

- Uses Redis to store counter keys: `fastapi-limiter:{identifier}:{endpoint}`
- Identifier usually derived from user IP or authenticated user ID
- Counters expire after time window

### Sensitive Data

- Private keys never sent to frontend, stored only in backend env vars
- Passwords stored hashed (bcrypt)
- JWT secret should be long and random
- Database passwords in Docker Compose (development only)

---

## Monitoring & Observability

- **FastAPI docs:** Auto-generated at `/docs` (Swagger UI) and `/redoc`
- **Logs:** Container logs available via `docker-compose logs` (no structured logging currently)
- **Metrics:** Not implemented (could add Prometheus exporters)
- **Health checks:** PostgreSQL healthcheck in Compose; backend not exposing /health (could add)

---

## Future Workflow Additions

- **Notifications:** Email/webhook on low inventory, shipment delay, PO approval
- **Blockchain event listeners:** Detect when transactions are mined, update DB accordingly
- **Multi-step PO approval:** Configurable routing based on amount, supplier, etc.
- **Invoice matching:** Compare invoice, PO, delivery receipt images; flag anomalies
- **Supplier portal:** Allow suppliers to view POs, upload documents, acknowledge shipments
- **Enhanced DAO:** On-chain voting with token-based governance

---

*This document captures the current implementation flows. For architectural diagrams, see ARCHITECTURE_MAP.md. For questions about incomplete workflows, see OPEN_QUESTIONS.md.*
