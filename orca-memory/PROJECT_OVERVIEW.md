# Orca SCM Platform - Project Overview

## Executive Summary

**Orca** is a full-stack, AI-powered, Web3-native Supply Chain Management (SCM) platform designed to bring transparency, efficiency, and intelligence to logistics operations. It combines traditional supply chain management with cutting-edge technologies like blockchain (Ethereum), decentralized storage (IPFS), machine learning, and real-time data oracles.

**Purpose:** Enable businesses to track shipments, manage inventory, automate procurement, and gain predictive insights while maintaining immutable, transparent records on the blockchain.

**Target Users:** Supply chain managers, procurement officers, warehouse operators, and businesses seeking to modernize their logistics with Web3 integration.

**Current Development Status:** The platform is feature-complete for an MVP with core functionality implemented and fully integrated. It's ready for deployment and testing, with several roadmap items identified for future enhancement.

---

## Core Capabilities

### 1. Shipment Tracking & NFTs
- Create shipments recorded on-chain via `ShipmentTracker` smart contract
- Each shipment generates an immutable record with metadata stored on IPFS
- NFT passports (`SupplierNFT`) for goods/provenance tracking

### 2. Inventory Management
- Real-time inventory dashboard across multiple warehouses
- Tracks product details, quantities, reorder thresholds, suppliers
- Automated reordering when stock falls below threshold

### 3. AI & Predictive Analytics
- **Delay Prediction:** ML model (Isolation Forest) predicts shipment delay probability
- **Run-out Prediction:** Calculates when inventory will deplete based on consumption rates
- **Supplier Suggestions:** Recommends suppliers for products based on historical data

### 4. Purchase Order Management
- Create, view, and manage purchase orders
- Approval workflow with status updates (Pending → Approved/Rejected)
- Audit trail with timestamps

### 5. Supplier Analytics
- Tracks average processing time per supplier
- Performance metrics for supply chain optimization

### 6. Web3 Integrations
- Smart contracts for decentralized record-keeping
- DAO governance (proposal creation and voting)
- Chainlink oracle support for external data (testnet/mainnet)
- Wallet connectivity for user authentication/transactions

### 7. External Data Oracles
- Weather data integration (OpenWeatherMap, WeatherAPI, Weatherbit)
- GPS location tracking simulation
- Chainlink oracle placeholder

### 8. Computer Vision
- Stock counting via image upload using Roboflow API
- Automated inventory updates based on visual counts

### 9. User Security
- OAuth2 password flow
- JWT token-based authentication
- Role-based access control (protected endpoints)
- Rate limiting to prevent abuse

### 10. Developer Experience
- Docker Compose for one-command full-stack deployment
- API documentation via FastAPI's automatic docs
- Type-safe data models with Pydantic

---

## Business Value

1. **Transparency:** Blockchain creates auditable, tamper-proof records of all shipments and transformations.
2. **Automation:** AI-driven predictions and automated reordering reduce manual intervention.
3. **Efficiency:** Real-time dashboards and analytics enable faster decision-making.
4. **Trust:** Decentralized verification reduces disputes and fraud.
5. **Scalability:** Microservices-ready architecture with containerized deployment.

---

## Implementation Highlights

### Backend (FastAPI + PostgreSQL)
- Clean separation: API layer → DAO layer → Database
- SQLAlchemy ORM with defined models for inventory, shipments, purchase orders, users
- Comprehensive CRUD operations with proper error handling
- Rate limiting with Redis backend
- CORS-enabled for frontend communication

### Frontend (Next.js + Material-UI)
- Responsive dashboard with animated UI (Framer Motion)
- Feature-rich pages: Home, Inventory Dashboard, Purchase Orders, Shipments
- Wallet integration (Web3Modal/Ethers.js) for blockchain interactions
- Real-time data loading with error states and loading indicators
- API proxy via Next.js rewrites to avoid CORS in production

### Blockchain (Solidity + Hardhat)
- Two core contracts:
  - `ShipmentTracker`: Records shipment creation and delivery status
  - `SupplierNFT`: ERC721 token for minting NFT passports
- Deployable to any Ethereum network (local/testnet/mainnet)
- ABI export scripts for frontend/backend consumption

### AI/ML
- **Delay Prediction:** Isolation Forest anomaly detection model (saved as `ai/nlp/delay_model.pkl`)
- **Inventory Run-out:** Simple arithmetic based on consumption rate
- **Supplier Matching:** Rule-based filtering from inventory data

---

## Known Limitations & Future Work

See `OPEN_QUESTIONS.md` for detailed uncertainties. High-priority roadmaps:

- Advanced supplier suggestion ML model (currently rule-based)
- Comprehensive KPI dashboards (cost-saving, quality, delivery KPIs from PDF)
- Notification system (email/webhooks) for threshold breaches
- Enhanced visualization (charts, maps)
- Invoice anomaly detection
- Full supplier portal with document upload
- Improved AI models with richer features
- Production-grade security for private keys (encryption, vaults)

---

## Getting Started

1. Clone repository: `https://github.com/iyeque/orca`
2. Copy `.env.example` to `.env` and fill in API keys (weather, Roboflow, Pinata, Ethereum RPC)
3. Run `docker-compose up --build -d`
4. Deploy smart contracts: `cd web3 && npm install && npx hardhat compile && npx hardhat run scripts/deploy.js --network localhost`
5. Export ABIs: `npx hardhat run scripts/export_abi_and_address.js`
6. Access frontend: http://localhost:3000, backend: http://localhost:8000/docs

---

## Repository

**GitHub:** https://github.com/iyeque/orca

**License:** (To be determined - check LICENSE file)

**Contributors:** Primary developer(s) as per GitHub history.

---

*This overview is based on code scan as of 2025-03-18. For detailed technical information, see ARCHITECTURE_MAP.md, TECH_STACK.md, and WORKFLOWS.md.*
