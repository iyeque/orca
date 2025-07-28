import random

def get_weather(location):
    # Simulate weather data
    return {
        'location': location,
        'temperature': round(random.uniform(-10, 40), 1),
        'condition': random.choice(['Clear', 'Rain', 'Storm', 'Fog', 'Snow'])
    }

def get_chainlink_weather(location):
    # Placeholder for real Chainlink oracle integration
    # In production, fetch from Chainlink node or API
    return {
        'location': location,
        'temperature': 22.5,  # Example static value
        'condition': 'Chainlink: Clear'
    }

def get_gps(shipment_id):
    # Simulate GPS coordinates
    return {
        'shipment_id': shipment_id,
        'lat': round(random.uniform(-90, 90), 6),
        'lon': round(random.uniform(-180, 180), 6)
    } 