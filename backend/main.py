from fastapi import FastAPI, Body, UploadFile
from .ai_gateway import predict_delay
from .ipfs_client import pin_json, get_json
from .web3_client import create_shipment, mint_nft
import os
from .oracle import get_weather, get_gps, get_chainlink_weather
from .vision import count_stock_from_image
from .dao import create_proposal, vote, get_proposals

app = FastAPI()

# In-memory store for demo
shipments = []

@app.post("/create-shipment")
def create_shipment_api(data: dict = Body(...)):
    # 1. Pin metadata to IPFS
    ipfs_hash = pin_json(data)
    # 2. Interact with smart contract (simulate sender for demo)
    sender_pk = os.environ.get('SHIPMENT_SENDER_PK')
    tx = create_shipment(ipfs_hash, sender_pk)
    # 3. Store locally for demo
    shipment = {"id": len(shipments)+1, "ipfs_hash": ipfs_hash, **data, "tx": tx}
    shipments.append(shipment)
    return shipment

@app.post("/mint-nft")
def mint_nft_api(data: dict = Body(...)):
    to = data['to']
    sender_pk = os.environ.get('NFT_SENDER_PK')
    tx = mint_nft(to, sender_pk)
    return {"tx": tx}

@app.get("/shipments")
def list_shipments():
    # Optionally fetch from chain/IPFS
    return shipments

@app.get("/shipment/{ipfs_hash}")
def get_shipment(ipfs_hash: str):
    return get_json(ipfs_hash)

@app.post("/predict-delay")
def predict(data: dict = Body(...)):
    return predict_delay(data)

@app.get("/oracle/weather")
def oracle_weather(location: str):
    return get_weather(location)

@app.get("/oracle/gps")
def oracle_gps(shipment_id: int):
    return get_gps(shipment_id)

@app.get("/oracle/chainlink-weather")
def oracle_chainlink_weather(location: str):
    return get_chainlink_weather(location)

@app.post("/vision/count-stock")
def vision_count_stock(file: UploadFile):
    return count_stock_from_image(file)

@app.post("/dao/proposal")
def dao_create_proposal(data: dict = Body(...)):
    pid = create_proposal(data['title'], data['description'])
    return {'proposal_id': pid}

@app.post("/dao/vote")
def dao_vote(data: dict = Body(...)):
    success = vote(data['proposal_id'])
    return {'success': success}

@app.get("/dao/proposals")
def dao_list_proposals():
    return get_proposals() 