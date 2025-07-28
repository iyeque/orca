from web3 import Web3
import json
import os

w3 = Web3(Web3.HTTPProvider('http://blockchain:8545'))

with open(os.path.join(os.path.dirname(__file__), '../smart_contracts/ShipmentTracker.abi.json')) as f:
    SHIPMENT_ABI = json.load(f)
with open(os.path.join(os.path.dirname(__file__), '../smart_contracts/SupplierNFT.abi.json')) as f:
    NFT_ABI = json.load(f)

SHIPMENT_ADDRESS = os.environ.get('SHIPMENT_TRACKER_ADDRESS')
NFT_ADDRESS = os.environ.get('SUPPLIER_NFT_ADDRESS')

shipment_contract = w3.eth.contract(address=SHIPMENT_ADDRESS, abi=SHIPMENT_ABI)
nft_contract = w3.eth.contract(address=NFT_ADDRESS, abi=NFT_ABI)

def create_shipment(description, sender_pk):
    tx = shipment_contract.functions.createShipment(description).build_transaction({
        'from': sender_pk,
        'nonce': w3.eth.get_transaction_count(sender_pk)
    })
    # Sign and send transaction (private key management required)
    return tx

def mint_nft(to, sender_pk):
    tx = nft_contract.functions.mint(to).build_transaction({
        'from': sender_pk,
        'nonce': w3.eth.get_transaction_count(sender_pk)
    })
    return tx 