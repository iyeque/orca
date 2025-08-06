import requests
import os
import json

PINATA_API_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
PINATA_JWT = os.environ.get('PINATA_JWT')

def pin_json(data):
    if not PINATA_JWT:
        raise ValueError("PINATA_JWT environment variable not set")

    headers = {
        "Authorization": f"Bearer {PINATA_JWT}",
        "Content-Type": "application/json"
    }
    response = requests.post(PINATA_API_URL, headers=headers, data=json.dumps(data))
    response.raise_for_status()  # Raise an exception for bad status codes
    return response.json().get("IpfsHash")

def get_json(cid):
    # Use a public gateway to retrieve the JSON data
    gateway_url = f"https://gateway.pinata.cloud/ipfs/{cid}"
    response = requests.get(gateway_url)
    response.raise_for_status()
    return response.json() 