# Orca SCM Platform - Architecture Map

## Repository Structure

```
orca/
│
├── ai/                                    # Legacy AI modules (duplicate of backend/ai?)
│   └── nlp/
│       ├── __init__.py
│       ├── delay_predictor.py           # Random delay predictor (demo)
│       └── inventory_predictor.py       # Run-out prediction (used by backend)
│
├── backend/                               # FastAPI backend service
│   ├── __init__.py
│   ├── main.py                          # Application entry point, all API routes
│   ├── schemas.py                       # Pydantic models for request/response validation
│   ├── dao.py                           # Database Access Layer: DAO classes + SQLAlchemy models
│   ├── security.py                      # Authentication utilities (JWT, password hashing)
│   ├── ipfs_client.py                   # IPFS interaction (Pinata integration)
│   ├── web3_client.py                   # Ethereum contract interactions
│   ├── oracle.py                        # Oracle integrations (weather, GPS, Chainlink)
│   ├── vision.py                        # Computer vision via Roboflow
│   ├── ai_gateway.py                    # Delay prediction endpoint (serves ML model)
│   ├── ai/                              # AI/ML modules
│   │   ├── __init__.py
│   │   ├── supplier_suggester.py       # Supplier recommendation engine
│   │   └── nlp/
│   │       ├── __init__.py
│   │       └── inventory_predictor.py  # Run-out prediction (duplicate from top-level ai/)
│   ├── contracts/                       # Smart contract ABIs and addresses
│   │   ├── ShipmentTracker.abi.json
│   │   ├── SupplierNFT.abi.json
│   │   └── contract_addresses.json     # Populated after deployment
│   ├── requirements.txt                # Python dependencies
│   └── Dockerfile                       # Container build for backend
│
├── frontend/                              # Next.js frontend application
│   ├── src/
│   │   ├── components/                  # Reusable React components
│   │   │   ├── AnimatedCard.jsx         # Animated card with Framer Motion
│   │   │   ├── DAOWidget.jsx            # DAO proposal/voting UI
│   │   │   ├── FeatureCard.jsx          # Feature showcase card
│   │   │   ├── InventoryDashboard.jsx  # Main inventory table with predictions
│   │   │   ├── OracleWidget.jsx         # Weather/GPS oracle UI
│   │   │   ├── OrcaHeader.jsx           # Header with navigation
│   │   │   ├── PurchaseOrderDashboard.jsx # PO listing and management
│   │   │   ├── PurchaseOrderForm.jsx   # Create/Edit PO form
│   │   │   ├── ShipmentForm.jsx         # Create shipment form
│   │   │   ├── ShipmentList.jsx         # Shipment history table
│   │   │   ├── SupplierAnalytics.jsx   # Supplier performance charts
│   │   │   ├── VisionWidget.jsx         # Image upload for stock counting
│   │   │   └── WalletConnect.jsx        # Web3 wallet connection (Web3Modal)
│   │   ├── services/
│   │   │   ├── api.js                  # API client functions for all endpoints
│   │   │   └── wallet.js               # Wallet connection utilities
│   │   ├── styles/
│   │   │   └── globals.css             # Global styles
│   │   ├── theme/
│   │   │   └── orcaTheme.js            # Material-UI theme customization
│   │   └── pages/
│   │       ├── _app.js                 # App wrapper with ThemeProvider/CssBaseline
│   │       └── index.js                # Homepage (landing page + feature showcase)
│   ├── public/                          # Static assets (favicon, etc.)
│   ├── Dockerfile                       # Multi-stage production build
│   ├── next.config.js                   # Next.js config with API rewrite
│   ├── package.json                     # Node dependencies
│   └── package-lock.json
│
├── web3/                                # Ethereum smart contracts & scripts
│   ├── smart_contracts/
│   │   ├── ShipmentTracker.sol         # Tracks shipments on-chain
│   │   └── SupplierNFT.sol             # ERC721 NFT for goods passports
│   ├── scripts/
│   │   ├── deploy.js                   # Deploy contracts to network
│   │   ├── deploy_contracts.js         # Wrapper for multiple contracts
│   │   ├── export_abi_and_address.js  # Exports ABIs and addresses to backend/
│   │   └── contract_addresses.json     # Generated after deployment
│   ├── hardhat.config.js               # Hardhat configuration
│   ├── package.json
│   └── package-lock.json
│
├── ipfs_data/                           # Persistent IPFS storage (local node)
│   ├── blocks/                         # IPFS block storage
│   └── datastore/                      # IPFS datastore
│
├── docker-compose.yml                  # Orchestrates all services
├── .env.example                        # Environment variable template
├── .gitignore
├── README.md                           # Main documentation
├── update.md                           # Roadmap and future enhancements
├── analysis.md                         # Code analysis and recommendations
├── PURCHASE_ORDER_WORKFLOW_PO_KPIS_METRICS_.pdf  # Reference document for KPIs
├── LICENSE
└── orca-memory/                       # Repository analysis documentation (created by Orca agent)
    ├── 2025-03-18.md
    ├── PROJECT_OVERVIEW.md
    ├── ARCHITECTURE_MAP.md            # This file
    ├── TECH_STACK.md
    ├── WORKFLOWS.md
    └── OPEN_QUESTIONS.md
```

---

## Component Breakdown

### Backend (FastAPI)

**Entry Point:** `backend/main.py`
- Defines FastAPI app and all route handlers
- Authentication: OAuth2 password flow, JWT tokens
- Rate limiting: `fastapi-limiter` with Redis
- Exception handlers for validation, HTTP, and generic errors
- Startup event initializes Redis connection

**Key Dependencies:**
- `schemas.py`: Pydantic models for all data types
  - Inventory, Shipment, PurchaseOrder, SupplierAnalytics
  - User, Token, ErrorResponse
- `dao.py`: Data Access Objects + SQLAlchemy ORM models
  - Models: Inventory, Shipment, PurchaseOrder, User
  - DAO classes: InventoryDAO, ShipmentDAO, PurchaseOrderDAO, UserDAO
- `ipfs_client.py`: Pin JSON to IPFS, retrieve from IPFS gateway
- `web3_client.py`: Contract deployment interactions (create_shipment, mint_nft)
- `oracle.py`: Weather (OpenWeatherMap), GPS simulation, Chainlink placeholder
- `vision.py`: Roboflow integration for object detection/stock counting
- `ai/supplier_suggester.py`: Match suppliers to product needs
- `ai/nlp/inventory_predictor.py`: Calculate run-out dates
- `ai_gateway.py`: Load Isolation Forest model and predict delays

**API Endpoints (Grouped by Purpose):**
- Auth: `/register`, `/token`, `/users/me`
- Shipments: `/create-shipment`, `/shipments`, `/shipment/{ipfs_hash}`
- Inventory: `/inventory` (GET/POST), `/inventory/{product_id}` (PUT)
- Predictions: `/inventory/predictions`, `/inventory/check-reorder`
- Purchase Orders: `/purchase-orders` (GET/POST), `/purchase-orders/{po_id}`, `/purchase-orders/{po_id}/status`
- Suppliers: `/suppliers`, `/analytics/supplier/{supplier_id}`, `/suggest-suppliers`
- AI: `/predict-delay`
- Oracles: `/oracle/weather`, `/oracle/gps`, `/oracle/chainlink-weather`
- Vision: `/vision/count-stock/{product_id}`
- DAO: `/dao/proposal`, `/dao/vote`, `/dao/proposals`

### Frontend (Next.js)

**Public Pages:**
- `/` (index.js): Landing page with hero, feature cards, Why Web3 section, stats
- `/Dashboard` (inferred): Main application interface (not in provided scans but referenced)
  - Likely includes InventoryDashboard, ShipmentForm, ShipmentList, etc.

**Components (reusable UI):**
- OrcaHeader: Navigation bar
- InventoryDashboard: Table view of inventory with predictions and reorder button
- PurchaseOrderDashboard: PO listing with status management
- PurchaseOrderForm: Create new PO
- ShipmentForm: Create new shipment with IPFS metadata
- ShipmentList: Display shipment history
- SupplierAnalytics: Supplier performance metrics
- OracleWidget: Weather/GPS lookup interface
- VisionWidget: Image upload for stock counting
- DAOWidget: Proposal creation and voting
- WalletConnect: Web3 wallet connection (likely modal)
- FeatureCard, AnimatedCard: Presentation components

**Services:**
- `api.js`: Functions that call backend endpoints (fetch wrapper)
- `wallet.js`: Web3Modal setup, wallet state, account detection

**Styling:**
- Material-UI (MUI) v5 component library
- Custom theme in `theme/orcaTheme.js`
- Global CSS in `styles/globals.css`
- Framer Motion for animations

**Configuration:**
- `next.config.js`: API rewrite proxies `/api/*` to backend URL
- `Dockerfile`: Multi-stage build (deps → builder → runner)

### Web3 (Solidity + Hardhat)

**Smart Contracts:**

1. **ShipmentTracker.sol**
   - Struct: `Shipment` (id, description, owner, delivered)
   - Mappings: `shipments` by id
   - Events: `ShipmentCreated`, `ShipmentDelivered`
   - Functions: `createShipment(string)`, `markDelivered(uint)`
   - Simple ownership model: only owner can mark delivered

2. **SupplierNFT.sol**
   - ERC721 token (imports OpenZeppelin)
   - Name: "SupplierNFT", Symbol: "SNFT"
   - Admin-restricted minting: `mint(address to)` only admin
   - Auto-incrementing token IDs

**Deployment Scripts (web3/scripts/):**
- `deploy.js`: Deploys a single contract (likely ShipmentTracker)
- `deploy_contracts.js`: Deploys both contracts
- `export_abi_and_address.js`: After deployment, reads contract_addresses.json and copies ABIs + addresses to backend/contracts/
- `contract_addresses.json`: Generated file with deployed addresses per network

**Hardhat Config:**
- Standard Hardhat setup for Ethers.js/TypeScript
- Configured for localhost (Ganache) and potentially testnets

### Docker & Orchestration

**docker-compose.yml** defines services:

1. **backend**
   - Build from backend/Dockerfile
   - Port 8000 exposed
   - Env: DATABASE_URL, REDIS_URL, SHIPMENT_SENDER_PK, NFT_SENDER_PK
   - Depends on db and redis (health check on db)

2. **frontend**
   - Build from frontend/ with build arg NEXT_PUBLIC_BACKEND_API_URL
   - Port 3000 exposed
   - Depends on backend

3. **blockchain**
   - Image: trufflesuite/ganache-cli
   - Port 8545 exposed (JSON-RPC)
   - Host 0.0.0.0

4. **ipfs**
   - Image: ipfs/go-ipfs:v0.7.0
   - Port 5001 exposed (API)
   - Volume: ./ipfs_data mounted to /data/ipfs

5. **db**
   - Image: postgres:13-alpine
   - Port 5432 exposed
   - Env: POSTGRES_USER=user, POSTGRES_PASSWORD=password, POSTGRES_DB=orca_db
   - Volume: db_data for persistence
   - Healthcheck: pg_isready

6. **redis**
   - Image: redis:alpine
   - Port 6379 exposed
   - Restart always

**Networks:** Docker Compose creates default network so services can reach each other by service name (e.g., `backend` resolves to backend container).

---

## Data Flow in Architecture

### 1. Create Shipment Flow
1. User fills ShipmentForm (frontend)
2. POST `/api/create-shipment` with shipment data
3. Backend:
   - Validates with Pydantic (ShipmentCreate)
   - Pins JSON metadata to IPFS (Pinata) → gets IPFS hash
   - Calls `create_shipment()` from web3_client.py:
     - Loads ShipmentTracker contract via ABI + address
     - Builds transaction to call `createShipment(description)`
   - Stores Shipment record in PostgreSQL via ShipmentDAO
   - Returns Shipment object
4. Frontend displays success with tx hash

### 2. Inventory Update via Vision
1. User uploads image in VisionWidget
2. POST `/api/vision/count-stock/{product_id}` with image
3. Backend:
   - Calls Roboflow model → returns predictions
   - Counts predictions (objects detected)
   - Updates inventory item quantity in DB
   - If increase, marks a shipment as delivered (business logic)
4. Frontend refreshes inventory view

### 3. Delay Prediction
1. Frontend sends shipment features to `/api/predict-delay`
2. Backend loads Isolation Forest model (cached in ai_gateway.py)
3. Returns delay probability score

### 4. Automated Reorder
1. User clicks "Check Reorder Levels" in InventoryDashboard
2. POST `/api/inventory/check-reorder`
3. Backend:
   - Fetches all inventory items
   - For items where quantity < reorder_threshold:
     - Creates ShipmentCreate object with default_reorder_quantity
     - Stores in DB (but does NOT call IPFS/blockchain for automation) (FIXME: should it?)
4. Returns count of created shipments

---

## Dependency Graph

```
Frontend (Next.js)
    ↓ (HTTP API)
Backend (FastAPI)
    ├─→ PostgreSQL (inventory, shipments, purchase_orders, users)
    ├─→ Redis (rate limiting)
    ├─→ IPFS/Pinata (metadata storage)
    ├─→ Ethereum RPC (blockchain)
    ├─→ Roboflow API (vision)
    ├─→ Weather APIs (oracles)
    └─→ Local AI models (delay prediction)

Smart Contracts
    └─→ Ethereum network (Ganache local / testnet / mainnet)
```

---

## Key Configuration Files

- `.env.example`: All required environment variables
- `docker-compose.yml`: Service orchestration
- `backend/requirements.txt`: Python dependencies
- `frontend/package.json`: Node dependencies
- `web3/hardhat.config.js`: Blockchain networks
- `backend/main.py`: Application settings (rate limits, token expiry)

---

## Security Considerations

- **Secrets in Env Vars:** Private keys (SHIPMENT_SENDER_PK, NFT_SENDER_PK), API keys, JWT secret
- **Database Credentials:** Hard-coded in docker-compose.yml (OK for dev, not prod)
- **JWT Secret:** Must be strong and rotated in production
- **Rate Limiting:** Applied to most endpoints via fastapi-limiter
- **Password Hashing:** bcrypt via passlib

---

## Deployment Topology

**Local Dev:** Docker Compose brings up all services; contracts deployed to local Ganache.

**Production (Recommended):**
- Frontend: Vercel (serverless Next.js)
- Backend: Render/Railway/DigitalOcean (Docker container)
- Database: Managed PostgreSQL (e.g., Supabase, AWS RDS)
- Redis: Managed or separate container
- Blockchain: Public testnet (Sepolia) or mainnet with secure RPC
- IPFS: Pinata or dedicated pinning service (not local node)
- AI: Model training could be separate service; inference in backend

---

*For details on technologies, see TECH_STACK.md. For data flows, see WORKFLOWS.md. For uncertainties, see OPEN_QUESTIONS.md.*
