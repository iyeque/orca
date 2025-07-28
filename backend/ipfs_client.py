import ipfshttpclient

client = ipfshttpclient.connect('/dns/localhost/tcp/5001/http')

def pin_json(data):
    res = client.add_json(data)
    return res

def get_json(cid):
    return client.get_json(cid) 