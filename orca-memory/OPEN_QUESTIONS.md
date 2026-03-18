# Orca SCM Platform - Open Questions

## Purpose

This document lists uncertainties, ambiguities, and decisions that require clarification from the project owner (Max/Wilmax) to ensure the knowledge base is accurate and actionable. These questions cover architecture, implementation details, roadmap priorities, and missing requirements.

---

## Category 1: Architecture & Implementation

### Q1: Duplicate AI Modules
**Observation:** There appear to be two copies of `inventory_predictor.py`:
- `/home/iyeque/.openclaw/workspace/orca/ai/nlp/inventory_predictor.py`
- `/home/iyeque/.openclaw/workspace/orca/backend/ai/nlp/inventory_predictor.py`

**Question:** Which one is the authoritative version? Should the `ai/` directory be removed or is it used for something else (e.g., separate training scripts)?

### Q2: Frontend Dashboard Page
**Observation:** The landing page (`pages/index.js`) is clear, but there is no `pages/Dashboard.js` or similar in the file list. However, components like `InventoryDashboard.jsx` exist, implying a dashboard page.

**Question:** Where is the main Dashboard page located? Is it in a different branch, or was it omitted from the analysis? Should it be created?

### Q3: Smart Contract Deployment Flow
**Observation:** The `web3/scripts/` include deployment scripts. The `backend/main.py` loads contract addresses from environment variables:
```python
SHIPMENT_ADDRESS = os.environ.get('SHIPMENT_TRACKER_ADDRESS')
NFT_ADDRESS = os.environ.get('SUPPLIER_NFT_ADDRESS')
```
But the `.env.example` does **not** include these variables.

**Question:** How are contract addresses communicated to the backend?
- Should they be set as env vars after deployment?
- Does the `export_abi_and_address.js` script write them to a file that backend reads?
- Should we add them to `.env.example`?

### Q4: User-Wallet Association
**Observation:** The `User` model in the backend has no blockchain address field. Smart contract transactions (e.g., `createShipment`) are sent using `SHIPMENT_SENDER_PK` from the backend's env, not the user's wallet.

**Question:** What is the intended relationship between authenticated users and blockchain identities?
- Should the backend sign transactions on behalf of users (custodial)?
- Should users connect wallets and sign transactions in the frontend (non-custodial)?
- Are `owner` fields in Shipment and NFT meant to be user addresses?

### Q5: Inconsistent IPFS vs Direct JSON Retrieval
**Observation:** `GET /shipment/{ipfs_hash}` fetches directly from IPFS gateway, not from the database. Meanwhile `GET /shipments` fetches from DB. This means the DB list and detail view may diverge if IPFS unpins data.

**Question:** Should `GET /shipment/{ipfs_hash}` also retrieve from DB for consistency, or is IPFS considered the source of truth?

### Q6: Automated Reorder Implementation
**Observation:** In `check_reorder_levels()`, new shipments are created only in the DB (`shipment_dao.create()`). They do **not** trigger IPFS pinning or blockchain transactions, unlike manual shipment creation.

**Question:** Is this intentional? Should automated reorders also be pinned to IPFS and recorded on-chain? If so, should they use a different sender (e.g., system service account)?

### Q7: Missing Pollution/Noise in Computer Vision
**Observation:** `vision.py` counts predictions from Roboflow model directly as stock quantity. Roboflow may return multiple classes or false positives.

**Question:** Should the vision count be filtered by class (e.g., only "box" or "product" labels)? Should there be confidence thresholding?

### Q8: DAO Implementation Completeness
**Observation:** DAO endpoints (`/dao/proposal`, `/dao/vote`, `/dao/proposals`) use in-memory functions that only log to console. No contracts for on-chain governance are present in `web3/smart_contracts/`.

**Question:** Are DAO features placeholder waiting for a governance contract? Or is the intention to keep it off-chain? If on-chain, what's the specification?

### Q9: Chainlink Oracle Integration
**Observation:** `oracle.py` has a function `get_chainlink_weather(location)` that returns static data. No Chainlink contract interaction is implemented.

**Question:** Is Chainlink integration intended for production, or is it just a "future item"? If it's to be implemented, should we set up a local Chainlink node or use a testnet oracle?

### Q10: Missing Health Check Endpoint
**Observation:** FastAPI app has no `/health` or `/ready` endpoint for orchestrators to check liveness/readiness.

**Question:** Should we add health checks? They are useful for Kubernetes/Render health probes.

---

## Category 2: Data Models & Business Logic

### Q11: Supplier Data Model
**Observation:** There is no explicit `Supplier` database model. Supplier info appears only as `supplier_id` strings in `Inventory`, `Shipment` (owner), and `PurchaseOrder`. The `SupplierNFT` contract mints NFTs to addresses (could be suppliers).

**Question:** Should there be a dedicated `suppliers` table with name, contact, performance metrics, etc.? Or is the use of just IDs intentional for simplicity?

### Q12: Purchase Order Line Items Structure
**Observation:** `PurchaseOrder.line_items` is stored as a string (presumably JSON) because the Pydantic model says `line_items: str`. The create endpoint uses `eval(po_data.line_items)` to compute total, which is risky.

**Question:**
- Should `line_items` be a proper JSONB column in PostgreSQL?
- Should we define a nested Pydantic model for line items (quantity, product_id, price_per_unit)?
- Should we avoid `eval()` and use `json.loads()` or proper parsing?

### Q13: Shipment Status Lifecycle
**Observation:** Shipment model has `delivered_date` but no explicit `status` field (could be inferred: delivered if not null). The contract also has a `delivered` boolean.

**Question:** Should we add an explicit `status` enum (e.g., PENDING, IN_TRANSIT, DELIVERED, CANCELLED) to the DB for clarity?

### Q14: Inventory Update on Delivery
**Observation:** The logic to mark a shipment delivered lives inside `update_inventory_item()` (when quantity increases). This ties inventory updates to shipments implicitly.

**Question:**
- Is this the intended business process? (Receive goods → count stock → update inventory → mark corresponding shipment delivered)
- What if multiple shipments for the same product can be partially delivered? The current code marks only one shipment delivered (returns after first match).

### Q15: Advanced KPI Metrics
**Observation:** `PURCHASE_ORDER_WORKFLOW_PO_KPIS_METRICS_.pdf` is present but not analyzed. It likely contains detailed KPIs for cost-saving, quality, delivery (from `update.md`).

**Question:** Should we prioritize implementing those KPIs? Which ones are most critical? Are there specific formulas or thresholds to follow?

---

## Category 3: Security & Operations

### Q16: Private Key Management in Production
**Observation:** `SHIPMENT_SENDER_PK` and `NFT_SENDER_PK` are stored in plain text environment variables. The code comment notes this as a TODO for secure management.

**Question:**
- What is the recommended approach? (e.g., encrypted secrets vault, KMS, HSM)
- Should transactions be signed by a user's wallet instead of a centralized service?

### Q17: JWT Secret Rotation
**Observation:** `SECRET_KEY` is used to sign JWTs. If compromised, all tokens could be forged.

**Question:** Is there a plan for key rotation? Should we implement a key ID (kid) in JWT header to support multiple active keys during rotation?

### Q18: Database Credentials in docker-compose.yml
**Observation:** `POSTGRES_USER` and `POSTGRES_PASSWORD` are hard-coded in `docker-compose.yml`. This is fine for local dev but not for production.

**Question:** For production deployments (Render, Vercel), how should database credentials be injected? Environment variables from the platform's secret store?

### Q19: Rate Limit Values
**Observation:** Rate limits are set per endpoint arbitrarily (e.g., 5/min for register, 60/min for reads). There's no configuration.

**Question:** Should these be configurable via environment variables? Are the current values sufficient?

---

## Category 4: Frontend & UX

### Q20: Wallet Integration Completeness
**Observation:** `WalletConnect.jsx` exists, but its usage is not visible in provided components. The homepage does not show wallet connection prominently.

**Question:** Where is wallet connection triggered? Should it be in the header (OrcaHeader) or on specific pages (e.g., create shipment)? Is the intent to require wallet for all actions or optional?

### Q21: Missing Inventory Dashboard Features
**Observation:** The dashboard shows predictions as dates but lacks:
- Reorder threshold warnings (e.g., highlight low stock)
- Buttons to create shipments manually from low-stock items
- Charts/graphs of inventory trends

**Question:** Should we enhance the dashboard with these features per `update.md` recommendations?

### Q22: Notification System Placeholder
**Observation:** `update.md` mentions a notification system (email/webhooks) but nothing exists.

**Question:** What kind of notifications are expected?
- Email when stock low? When shipment delayed? When PO approved?
- In-app notification center?
- Webhooks to external systems?

---

## Category 5: Roadmap & Prioritization

### Q23: Roadmap Priority
**Observation:** `update.md` lists many enhancements:
- Full PO module (maybe already done?)
- Supplier suggestion frontend integration
- Advanced KPI dashboards
- Invoice anomaly detection
- Supplier portal
- Improved AI models
- Notifications
- Visualizations (maps, charts)

**Question:** Which of these are high priority for the next phase? Should we focus on completing the supplier suggestion frontend first, or on advanced KPIs?

### Q24: Invoice Anomaly Detection
**Observation:** This feature is mentioned but not scoped.

**Question:** What inputs are needed? (Invoice image/OCR, PO data, delivery receipt). Should we integrate another vision model or use text extraction? Are there specific rules or ML models?

### Q25: Supplier Portal Scope
**Observation:** The portal would allow suppliers to view POs, acknowledge them, upload documents (invoices, ASNs).

**Question:** Should the portal be a separate interface or part of the main app with supplier-specific roles? How will supplier accounts be created (self-registration vs admin invite)?

---

## Category 6: Testing & Quality

### Q26: Test Coverage
**Observation:** No test files are visible (`tests/` directory not present). The project may lack unit/integration tests.

**Question:** Should we write tests (pytest for backend, Jest/React Testing Library for frontend)? Are there any existing test scripts?

### Q27: API Contract Validation
**Question:** Is there a need for OpenAPI schema validation in tests? Should we use schemathesis or similar?

---

## Category 7: Deployment & DevOps

### Q28: Production Deployment Strategy
**Observation:** `docker-compose.yml` is great for local dev, but production may differ (e.g., managed DB, separate IPFS).

**Question:** What is the target production environment?
- Render.com? Kubernetes? AWS?
- Will we keep Docker Compose or migrate to Helm/K8s manifests?
- How will we handle migrations (SQLAlchemy)?

### Q29: Database Migrations
**Observation:** SQLAlchemy's `Base.metadata.create_all()` creates tables on startup but there's no migration system (Alembic).

**Question:** Should we add Alembic for schema versioning and migrations? This is important for production upgrades.

### Q30: Monitoring & Alerting
**Observation:** No logging config, metrics, or alerting.

**Question:** Should we integrate:
- Structured logging (e.g., JSON logs to stdout)?
- Request/response logging middleware?
- Metrics (Prometheus)?
- Error tracking (Sentry)?

---

## Category 8: Blockchain Specifics

### Q31: Transaction Signing Flow
**Observation:** `web3_client.py` builds transactions but does not sign or send them. It returns the raw unsigned transaction object.

**Question:** Should the backend actually sign and send the transaction? If so, how to manage private keys securely? Should we delegate signing to the client's wallet (e.g., via MetaMask)?

### Q32: Contract Address Management
**Observation:** Hardhat deployment scripts output `contract_addresses.json` in `web3/scripts/`. The backend expects addresses via env vars.

**Question:** Should the backend read from that JSON file instead of env vars? Or should a CI/CD pipeline set env vars after deployment?

### Q33: NFT Association with Entities
**Observation:** The `SupplierNFT` contract is for minting NFTs, but it's unclear what they represent. The ShipmentTracker doesn't mint NFTs.

**Question:** What is the intended use of `SupplierNFT`? Is it for supplier identity? For goods passports? How are NFTs linked to shipments?

---

## Category 9: External Integrations

### Q34: Roboflow Model Details
**Observation:** Roboflow credentials come from env vars: `ROBOFLOW_MODEL_ID`, `ROBOFLOW_MODEL_VERSION`. No default model specified.

**Question:** Which Roboflow project and model version should be used? Are there deployment-specific values?

### Q35: Weather API Provider Choice
**Observation:** The code supports OpenWeatherMap by default but also lists WeatherAPI, Weatherbit as options in `.env.example` (though not implemented in code beyond the URL variable).

**Question:** Which provider should be the default? Should we abstract the weather client to support multiple providers with configuration?

---

## Category 10: Access Control & Roles

### Q36: User Roles and Permissions
**Observation:** The `User` model has only `username`, `email`, `hashed_password`, `is_active`. No role field. All endpoints require authentication but no role checks (only `get_current_user` dependency).

**Question:** Do we need different roles? (e.g., admin, manager, supplier, warehouse staff). Should certain endpoints be restricted (e.g., only admins can approve POs)?

### Q37: Multi-Tenancy
**Observation:** All data is in shared tables. There's no concept of organizations/tenants.

**Question:** Is Orca intended for multi-tenant SaaS (different companies share the same installation) or single-tenant per deployment? If multi-tenant, we need tenant_id on all tables and filtering.

---

## Category 11: Data Integrity & Validation

### Q38: Shipment Quantity vs Inventory Update
**Observation:** There's no direct link from a shipment to inventory update when a shipment is delivered. The inventory update occurs when someone manually updates quantity or runs vision, which then tries to find a pending shipment to mark delivered.

**Question:** Is this the intended design? Should we instead trigger an inventory increase when a shipment is marked delivered (perhaps via a separate endpoint or blockchain event listener)?

### Q39: IPFS Pinning Failures
**Observation:** `ipfs_client.py` raises exception if Pinata fails. The shipment creation would then fail entirely.

**Question:** Should we have a retry/backoff strategy? Or should we store the shipment in DB first and have a background job to retry IPFS pinning?

---

## Category 12: Performance & Scalability

### Q40: Pagination & Large Datasets
**Observation:** Endpoints like `/shipments`, `/inventory`, `/purchase-orders` return all records without pagination.

**Question:** At what scale do we expect these endpoints to be called? Should we implement limit/offset pagination or cursor-based pagination to handle hundreds/thousands of records?

### Q41: Caching Strategy
**Observation:** Redis is used only for rate limiting. No caching of frequent queries (e.g., inventory list, supplier analytics).

**Question:** Should we add caching? Use Redis to cache read-heavy endpoints with TTL (e.g., 5 minutes)?

---

## Category 13: Frontend Routing & Pages

### Q42: Dashboard Routing
**Observation:** The index page links to `/Dashboard` (capital D). Next.js pages are case-sensitive; `pages/Dashboard.js` would be needed.

**Question:** Is the Dashboard page in a different file not listed? Should it be `pages/dashboard.js` (lowercase)? We need to clarify the actual route structure.

### Q43: Missing Pages
**Observation:** Components exist for many features but no dedicated pages:
- Purchase order form (`PurchaseOrderForm.jsx`) - where is it used?
- Shipment creation page (`ShipmentForm.jsx`)
- Supplier analytics page

**Question:** Should these be separate pages under `/purchase-orders/new`, `/shipments/new`, `/suppliers`? Or are they all on the Dashboard?

---

## Category 14: Documentation & Onboarding

### Q44: Missing API Documentation in README
**Observation:** The README lists features but doesn't provide an API spec. FastAPI generates `/docs` automatically, but that's dynamic.

**Question:** Should we export the OpenAPI schema and commit it or include it in the docs? Or add example API calls in README?

### Q45: Contributing Guidelines
**Question:** Are there coding standards (Python PEP8, ESLint)? PR process? Testing requirements?

---

## Prioritization Request

Please review these questions and provide:
1. **High-priority items** that need resolution before proceeding with further development or documentation.
2. **Clarifications** on ambiguous design choices (e.g., duplicate AI modules, shipment signing).
3. **Roadmap timeline** for the features listed in `update.md`.

---

**Owner:** Wilmax / Max  
**Agent:** Orca (Repository Analysis & Documentation Specialist)  
**Date:** 2025-03-18
