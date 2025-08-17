# ORCA SCM Platform

A full-stack, AI-powered, Web3-native supply chain management platform with real-world integrations and modern UI.

## Features
- Shipment tracking smart contract (Solidity)
- NFT passports for goods (Solidity)
- IPFS metadata storage for immutable data
- AI-powered shipment delay prediction (Python, real ML)
- **Inventory Dashboard**: A real-time view of all your stock across different warehouses.
- **Predictive Analytics**: Forecast when you will run out of stock based on historical data and shipment delay predictions.
- **Automated Ordering**: Trigger new shipment requests when stock levels fall below a certain threshold.
- **Supplier Analytics**: Track how long it takes for a supplier's goods to be processed and ready for use after arrival.
- **Purchase Order Management**: Create, view, and manage purchase orders with approval workflow.
- **Supplier Suggestion Engine**: AI-powered supplier recommendations based on product needs (backend implemented, frontend integration pending).
- FastAPI backend
- React/Next.js frontend dashboard (wallet connect, animated UI)
- Real weather oracle integration (OpenWeatherMap, WeatherAPI, or Weatherbit)
- Real computer vision API integration (Inferdo, Roboflow, Clarifai, Dragoneye, etc.) for Inventory Vision
- DAO on-chain voting (Solidity + frontend)
- Chainlink oracle support (testnet/mainnet)
- Free Ethereum testnet RPC support
- Docker Compose for full-stack orchestration
- Enhanced homepage with feature showcase and Web3 explanation
- **Persistent Data Storage**: Now uses PostgreSQL for all core data (inventory, shipments, purchase orders), replacing in-memory storage.
- **Robust API**: Implemented with FastAPI, featuring Pydantic models for data validation, clear API documentation, and standardized error handling.
- **User Authentication & Authorization**: Secure user management with OAuth2 and JWT for protected API endpoints. **(Completed and fully integrated)**
- **API Rate Limiting**: Protects against abuse with configurable rate limits on key endpoints. **(Completed and fully integrated)**

## Inventory Management and Analytics

The ORCA SCM platform now includes a powerful suite of tools for managing your inventory and analyzing your supply chain performance.

### Inventory Dashboard

The main dashboard provides a real-time view of your inventory, including:
- Product details (ID, name)
- Quantity on hand
- Reorder thresholds
- Warehouse location
- Supplier information

### Predictive Analytics

Leveraging AI, the platform can predict when you will run out of stock for each product. This allows you to be proactive in your procurement process and avoid stockouts.

### Automated Ordering

Set reorder thresholds for your products and let the platform automatically create new shipment requests when stock levels are low. This feature helps to ensure that you always have enough inventory to meet demand.

### Supplier Analytics

Track the performance of your suppliers by measuring the average processing time from shipment creation to delivery. This data can help you to identify your most efficient suppliers and optimize your supply chain.

## Quickstart: Step-by-Step Run Guide (Local Development)

1.  **Clone the repo and navigate to the root directory**
    ```bash
    git clone <your-repo-url>
    cd <repo-root>
    ```

2.  **Set up environment variables**
    *   Copy `.env.example` to `.env` in the project root:
        ```bash
        cp .env.example .env
        ```
    *   Fill in your API keys and endpoints in the newly created `.env` file. Refer to the "Environment Variables" section below for details.

3.  **Get free API keys**
    *   Weather: [OpenWeatherMap](https://openweathermap.org/), [WeatherAPI.com](https://www.weatherapi.com/), [Weatherbit.io](https://www.weatherbit.io/)
    *   Vision: [Inferdo](https://inferdo.com/), [Roboflow](https://roboflow.com/), [Clarifai](https://www.clarifai.com/), [Dragoneye](https://dragoneye.ai/)
    *   Ethereum/Chainlink: [PublicNode](https://ethereum-rpc.publicnode.com), [Chainlink Faucets](https://faucets.chain.link/)

4.  **Start the Docker stack**
    *   This command will build the Docker images for the frontend, backend, IPFS, PostgreSQL, and Redis, and start all services along with a local Ganache blockchain.
    ```bash
    docker-compose up --build -d
    ```
    *   Frontend: `http://localhost:3000`
    *   Backend API: `http://localhost:8000`

5.  **Deploy smart contracts**
    *   Navigate to the `web3/` directory:
        ```bash
        cd web3
        ```
    *   Install Hardhat and other dependencies:
        ```bash
        npm install
        ```
    *   Compile the smart contracts:
        ```bash
        npx hardhat compile
        ```
    *   Deploy contracts to your local blockchain (Ganache, running via Docker Compose). This script will also save the deployed contract addresses to `web3/contract_addresses.json`:
        ```bash
        npx hardhat run scripts/deploy.js --network localhost
        ```
    *   Export ABI and addresses for frontend and backend use. This script reads from `web3/contract_addresses.json` and outputs ABI files and addresses to `backend/contracts/`:
        ```bash
        npx hardhat run scripts/export_abi_and_address.js
        ```
    *   **Important**: Ensure `SHIPMENT_SENDER_PK` and `NFT_SENDER_PK` are set in your `.env` file for the backend to interact with the deployed contracts.

6.  **Test the platform**
    *   Connect wallet in frontend
    *   Create shipments, mint NFTs, fetch metadata, predict delays, use oracles, upload images, and vote in DAO
    *   Explore the new Inventory Dashboard, check out the run-out predictions, trigger automated reordering, and analyze supplier performance.
    *   Register a user via the `/register` endpoint and obtain a token from `/token` to access protected API endpoints.

## Environment Variables
See `.env.example` for all required variables. Critical variables include:
-   `WEATHER_API_KEY`, `WEATHER_API_URL`: For weather oracle integration.
-   `VISION_API_KEY`, `VISION_API_URL`: For computer vision stock counting.
-   `ETH_RPC_URL`: Ethereum RPC endpoint for Web3 interactions.
-   `CHAINLINK_ORACLE_ADDRESS`, `CHAINLINK_JOB_ID`, `CHAINLINK_NODE_URL`, `CHAINLINK_API_KEY`: For Chainlink oracle integration.
-   `IPFS_API_URL`: For IPFS metadata storage. When running locally with Docker Compose, this is typically `http://ipfs:5001`.
-   `SHIPMENT_SENDER_PK`, `NFT_SENDER_PK`: Private keys for the backend to send transactions to the smart contracts (e.g., creating shipments, minting NFTs). **These are crucial for Web3 features to function.**
-   `NEXT_PUBLIC_BACKEND_API_URL`: Used by the Next.js frontend to connect to the backend API. When running locally with Docker Compose, this is `http://localhost:8000`. For Vercel deployment, this should be the public URL of your deployed backend.
-   **New**: `DATABASE_URL`: Connection string for the PostgreSQL database (e.g., `postgresql://user:password@db:5432/orca_db`).
-   **New**: `REDIS_URL`: Connection string for the Redis instance (e.g., `redis://redis:6379`).
-   **New**: `SECRET_KEY`: A strong, randomly generated key for JWT signing. **Crucial for security.**
-   **New**: `ALGORITHM`: The algorithm used for JWT signing (e.g., `HS256`).

**Security Note**: For production deployments, it is critical to manage `SECRET_KEY`, `SHIPMENT_SENDER_PK`, `NFT_SENDER_PK`, and other sensitive API keys securely. Avoid storing them directly in `.env` files in production environments. Consider using dedicated secrets management services (e.g., Kubernetes Secrets, AWS Secrets Manager, HashiCorp Vault) that provide encryption at rest and secure access controls.

## Directory Structure
-   `backend/` - FastAPI backend
-   `ai/` - AI modules (delay prediction)
-   `web3/` - Web3 scripts (deploy/interact) and Solidity contracts (`web3/smart_contracts/`)
-   `frontend/` - React/Next.js frontend

## Deployment Readiness

### Frontend (Vercel)

The Next.js frontend is configured for easy deployment to Vercel.

1.  **Connect your Git Repository:** Import your project into Vercel from your Git provider.
2.  **Configure Project:** Vercel will auto-detect Next.js.
3.  **Set Environment Variable:** In your Vercel project settings, add the `NEXT_PUBLIC_BACKEND_API_URL` environment variable. Its value should be the public URL of your deployed backend (e.g., `https://your-backend-app.render.com`).

### Backend (e.g., Render)

The FastAPI backend can be deployed to any platform supporting Docker containers, such as Render.

1.  **Connect your Git Repository:** Sign up for Render and connect your Git repository.
2.  **Create a New Web Service:**
    *   Set the **Root Directory** to `backend/`.
    *   Choose **Docker** as the runtime.
    *   Add all necessary environment variables from your local `.env` file to Render's service settings.
    *   Set a **Health Check Path** (e.g., `/docs` or `/redoc`).

### Important Deployment Notes

*   **Blockchain:** For production, replace the local Ganache (`trufflesuite/ganache-cli`) with a public testnet RPC URL or a managed blockchain service.
*   **IPFS:** For production, consider using a dedicated IPFS pinning service (e.g., Pinata, Web3.storage) instead of running your own IPFS node.
*   **Security:** Always manage sensitive information (private keys, API keys) securely via environment variables in your deployment platforms.

## backend/requirements.txt
```
fastapi
uvicorn
web3
python-dotenv
ipfshttpclient
Pillow
numpy
scikit-learn
pandas
roboflow
SQLAlchemy
psycopg2-binary
passlib[bcrypt]
python-jose[cryptography]
fastapi-limiter
```

---

For more, see the docs and each integration's README.