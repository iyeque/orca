# Orca SCM Platform - Technology Stack

## Summary Table

| Layer | Technology | Purpose | Version/Tool |
|-------|------------|---------|-------------|
| Frontend | Next.js | React framework with SSR/SSG | 13.4.19 |
| | React | UI library | 18.2.0 |
| | Material-UI (MUI) | Component library | 5.15.19 |
| | Framer Motion | Animations | 11.2.12 |
| | Ethers.js | Ethereum interaction | 5.7.2 |
| | Web3Modal | Wallet connection | 1.9.12 |
| Backend | FastAPI | Web framework | (uses Starlette, Pydantic) |
| | Uvicorn | ASGI server | (in requirements) |
| | SQLAlchemy | ORM | 2.x (in requirements) |
| | PostgreSQL | Relational database | 13 (Docker image) |
| | Redis | Cache & rate limiting | (Docker image) |
| Blockchain | Solidity | Smart contract language | ^0.8.0 |
| | Hardhat | Development environment | (in web3/package.json) |
| | Web3.py | Python Ethereum library | (in requirements) |
| | Ganache | Local blockchain | trufflesuite/ganache-cli |
| AI/ML | scikit-learn | Machine learning | (Isolation Forest) |
| | pandas | Data manipulation | |
| | numpy | Numerical computing | |
| | joblib | Model persistence | (implicit via sklearn) |
| | Roboflow | Computer vision API | (cloud service) |
| Storage | IPFS | Decentralized metadata storage | go-ipfs v0.7.0 |
| | Pinata | IPFS pinning service | (cloud service) |
| Oracles | OpenWeatherMap | Weather data | (cloud API) |
| | Chainlink | Decentralized oracle network | (placeholder) |
| Dev Ops | Docker | Containerization | 20+ (images) |
| | Docker Compose | Multi-container orchestration | 3.8 |
| | Node.js | JavaScript runtime | 18/20 (Docker stages) |
| | Python | Backend language | 3.10-slim |
| Deployment | Vercel | Frontend hosting (recommended) | - |
| | Render/Railway | Backend hosting (recommended) | - |
| Auth | OAuth2 | Password flow | FastAPI's OAuth2PasswordBearer |
| | JWT | Token-based auth | python-jose[cryptography] |
| | bcrypt | Password hashing | passlib[bcrypt] |

---

## Frontend Technologies

### Next.js 13 (App Pages Router)
- **Framework:** Next.js with pages directory structure
- **Rendering:** Likely static generation + client-side interactivity
- **API Proxying:** next.config.js rewrites `/api/*` to backend URL
- **Styling:** Material-UI with Emotion (emotion/react, emotion/styled)
- **Animations:** Framer Motion for smooth transitions
- **State Management:** React useState/useEffect (no Redux/Zustand yet)
- **Web3:** Ethers.js v5 + Web3Modal v1 for wallet connection

### Material-UI Components Used
- Box, Typography, Button, Container, Grid, Paper, Dialog, Table, Alert, CircularProgress
- Icons: @mui/icons-material (e.g., VisibilityIcon, ScienceIcon, etc.)

### Theme Customization
- Custom theme in `src/theme/orcaTheme.js` extends MUI's default with Orca brand colors

---

## Backend Technologies

### FastAPI Ecosystem
- **FastAPI:** Modern Python web framework with automatic OpenAPI docs
- **Uvicorn:** ASGI server for running FastAPI
- **Pydantic:** Data validation and settings management
- **Python-multipart:** For handling form data (file uploads)

### Database & Caching
- **PostgreSQL 13:** Primary data store
  - Used via SQLAlchemy ORM
  - Connection via `DATABASE_URL` env var
- **Redis:** In-memory store for:
  - Rate limiting (fastapi-limiter)
  - Future: caching, sessions

### Authentication & Security
- **python-jose[cryptography]:** JWT encoding/decoding
- **passlib[bcrypt]:** Password hashing
- **fastapi-limiter:** Rate limiting middleware

### External API Clients
- **requests:** HTTP client for IPFS, weather, Roboflow
- **Roboflow:** Computer vision cloud API
- **OpenWeatherMap/WeatherAPI:** Weather data

### Blockchain (Web3)
- **web3.py:** Python Ethereum library (>=5.x)
- Connects to local Ganache or public RPC via ETH_RPC_URL or Docker internal `blockchain:8545`

### IPFS Integration
- **ipfshttpclient:** Alternative IPFS client (not actively used, replaced by Pinata?)
- **Pinata:** JWT-based pinning service (pinning/pinJSONToIPFS endpoint)

---

## AI/ML Stack

### Models

1. **Delay Prediction** (`backend/ai_gateway.py`)
   - Model: Isolation Forest (anomaly detection)
   - Library: scikit-learn
   - Persistence: joblib (saved as `ai/nlp/delay_model.pkl`)
   - Features: 3 numeric features (shipment attributes)

2. **Inventory Run-out Prediction** (`backend/ai/nlp/inventory_predictor.py` & `ai/nlp/inventory_predictor.py`)
   - Model: Deterministic calculation: days = quantity / daily_consumption_rate
   - Returns predicted run-out date

3. **Supplier Suggestion** (`backend/ai/supplier_suggester.py`)
   - Model: Rule-based lookup from inventory data
   - Returns list of supplier IDs that supply requested product IDs

### Data Processing
- **pandas:** Used for DataFrame conversion in delay prediction
- **numpy:** Numerical operations

---

## Blockchain Stack

### Smart Contracts (Solidity ^0.8.0)
- **ShipmentTracker:** Custom contract for shipment lifecycle
- **SupplierNFT:** ERC721 token (uses OpenZeppelin imports - note: must be installed via npm/hardhat)

### Development Tools
- **Hardhat:** Compilation, testing, deployment
- **Ethers.js:** JavaScript Ethereum library (in web3/scripts)
- **Ganache CLI:** Local Ethereum test network

### Environments
- **Local:** Dockerized Ganache on port 8545
- **Testnet:** Sepolia (via PublicNode or Infura)
- **Mainnet:** Not configured by default

---

## Storage & Decentralization

### IPFS
- **Node:** go-ipfs v0.7.0 (Docker container)
- **Pinning:** Pinata cloud service (API key + JWT)
  - Pins JSON metadata (shipment details)
  - Returns CID (Content Identifier)
- **Gateway:** Public gateway (gateway.pinata.cloud) for reads

### PostgreSQL
- Tables: inventory, shipments, purchase_orders, users
- Volume: `db_data` (Docker named volume)
- Backup: Manual pg_dump or volume snapshots

---

## External Services & APIs

| Service | Purpose | Integration Point |
|---------|---------|-------------------|
| Pinata | IPFS pinning | ipfs_client.py |
| OpenWeatherMap/WeatherAPI | Weather conditions | oracle.py |
| Roboflow | Object detection for inventory | vision.py |
| Chainlink (optional) | Decentralized oracles | oracle.py (placeholder) |
| PublicNode/Sepolia RPC | Ethereum testnet | web3_client.py & Hardhat |
| Vercel (recommended) | Frontend hosting | - |
| Render/Railway (recommended) | Backend hosting | - |

---

## Development Tools

### Backend
- Python 3.10
- pip for package management (requirements.txt)
- Optional: Jupyter/notebooks for model training (not present)

### Frontend
- Node.js 18/20
- npm for package management
- Next.js CLI for dev server (`npm run dev`)

### Blockchain
- Node.js + Hardhat
- Solidity compiler via Hardhat
- `npx hardhat` commands

### Infrastructure
- Docker & Docker Compose
- Git for version control
- VS Code or similar IDE recommended

---

## Version Compatibility Notes

1. **Node.js:** Frontend uses Node 18 (deps stage) and 20 (runner/builder). Use Node 20 for local dev if needed.
2. **Python:** Backend Dockerfile uses python:3.10-slim. Local dev should match.
3. **PostgreSQL:** Version 13 used in Docker; later versions should be compatible.
4. **Solidity:** ^0.8.0 (compatible with 0.8.x)
5. **Hardhat:** No specific version pinned; uses latest matching Node environment

---

## Notable Dependencies Not Yet Integrated

- **Chainlink:** Oracle integration placeholder exists but not functional without on-chain oracle contracts and node operator setup.
- **DAO voting:** Basic proposal/vote functions exist but no on-chain governance contracts visible.
- **Web3Modal v2:** Current frontend uses v1 (see package.json), newer version available with different API.

---

## Conclusion

The Orca SCM platform is built on a modern, developer-friendly stack combining Python (backend/AI), JavaScript/React (frontend), and Solidity (blockchain). The use of Docker ensures consistent environments across development and production. The choice of FastAPI provides high performance and automatic API documentation. Material-UI accelerates frontend development. The stack is well-suited for a startup/SME deploying to cloud platforms with managed databases and serverless frontends.
