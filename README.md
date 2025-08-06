# ORCA SCM Platform

A full-stack, AI-powered, Web3-native supply chain management platform with real-world integrations and modern UI.

## Features
- Shipment tracking smart contract (Solidity)
- NFT passports for goods (Solidity)
- IPFS metadata storage for immutable data
- AI-powered shipment delay prediction (Python, real ML)
- FastAPI backend
- React/Next.js frontend dashboard (wallet connect, animated UI)
- Real weather oracle integration (OpenWeatherMap, WeatherAPI, or Weatherbit)
- Real computer vision API integration (Inferdo, Roboflow, Clarifai, Dragoneye, etc.) for Inventory Vision
- DAO on-chain voting (Solidity + frontend)
- Chainlink oracle support (testnet/mainnet)
- Free Ethereum testnet RPC support
- Docker Compose for full-stack orchestration
- Enhanced homepage with feature showcase and Web3 explanation

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
    *   This command will build the Docker images for the frontend, backend, and IPFS, and start all services along with a local Ganache blockchain.
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

## Environment Variables
See `.env.example` for all required variables. Critical variables include:
-   `WEATHER_API_KEY`, `WEATHER_API_URL`: For weather oracle integration.
-   `VISION_API_KEY`, `VISION_API_URL`: For computer vision stock counting.
-   `ETH_RPC_URL`: Ethereum RPC endpoint for Web3 interactions.
-   `CHAINLINK_ORACLE_ADDRESS`, `CHAINLINK_JOB_ID`, `CHAINLINK_NODE_URL`, `CHAINLINK_API_KEY`: For Chainlink oracle integration.
-   `IPFS_API_URL`: For IPFS metadata storage. When running locally with Docker Compose, this is typically `http://ipfs:5001`.
-   `SHIPMENT_SENDER_PK`, `NFT_SENDER_PK`: Private keys for the backend to send transactions to the smart contracts (e.g., creating shipments, minting NFTs). **These are crucial for Web3 features to function.**
-   `NEXT_PUBLIC_BACKEND_API_URL`: Used by the Next.js frontend to connect to the backend API. When running locally with Docker Compose, this is `http://localhost:8000`. For Vercel deployment, this should be the public URL of your deployed backend.

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
scikit-learn
ipfshttpclient
pandas
requests
python-dotenv
pydantic
python-multipart
```

---

For more, see the docs and each integration's README.