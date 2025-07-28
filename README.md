# ORCA SCM Platform

A full-stack, AI-powered, Web3-native supply chain management platform with real-world integrations and modern UI.

## Features
- Shipment tracking smart contract (Solidity)
- NFT passports for goods (Solidity)
- IPFS metadata storage
- AI-powered shipment delay prediction (Python, real ML)
- FastAPI backend
- React/Next.js frontend dashboard (wallet connect, animated UI)
- Real weather oracle integration (OpenWeatherMap, WeatherAPI, or Weatherbit)
- Real computer vision API integration (Inferdo, Roboflow, Clarifai, Dragoneye, etc.)
- DAO on-chain voting (Solidity + frontend)
- Chainlink oracle support (testnet/mainnet)
- Free Ethereum testnet RPC support
- Docker Compose for full-stack orchestration

## Quickstart: Step-by-Step Run Guide

1. **Clone the repo and install dependencies**
   - `git clone <your-repo-url>`
   - `cd <repo-root>`
2. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your API keys and endpoints (see below for free options)
3. **Get free API keys**
   - Weather: [OpenWeatherMap](https://openweathermap.org/), [WeatherAPI.com](https://www.weatherapi.com/), [Weatherbit.io](https://www.weatherbit.io/)
   - Vision: [Inferdo](https://inferdo.com/), [Roboflow](https://roboflow.com/), [Clarifai](https://www.clarifai.com/), [Dragoneye](https://dragoneye.ai/)
   - Ethereum/Chainlink: [PublicNode](https://ethereum-rpc.publicnode.com), [Chainlink Faucets](https://faucets.chain.link/)
4. **Start the stack**
   - `docker-compose up --build`
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
5. **Deploy smart contracts**
   - Use Hardhat/Truffle scripts in `web3/` to deploy contracts to your testnet/mainnet
   - Export ABI and addresses for backend use
6. **Test the platform**
   - Connect wallet in frontend
   - Create shipments, mint NFTs, fetch metadata, predict delays, use oracles, upload images, and vote in DAO

## Environment Variables
See `.env.example` for all required variables (weather, vision, Ethereum, Chainlink, IPFS, etc.)

## Directory Structure
- `backend/` - FastAPI backend
- `ai/` - AI modules (delay prediction)
- `smart_contracts/` - Solidity contracts
- `web3/` - Web3 scripts (deploy/interact)
- `frontend/` - React/Next.js frontend

## Deployment Readiness
- All dependencies are listed in `backend/requirements.txt` (see below)
- Use `.env` for all secrets and API keys
- Supports Docker Compose for full-stack orchestration
- Ready for deployment to cloud or local testnet

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
```

---

For more, see the docs and each integration's README. 