import requests
import os
import random

WEATHER_API_KEY = os.environ.get('WEATHER_API_KEY')
WEATHER_API_URL = os.environ.get('WEATHER_API_URL', "https://api.openweathermap.org/data/2.5/weather")

def get_weather(location):
    if not WEATHER_API_KEY:
        # Fallback to placeholder if API key is not set
        return {
            'location': location,
            'temperature': round(random.uniform(-10, 40), 1),
            'condition': random.choice(['Clear', 'Rain', 'Storm', 'Fog', 'Snow'])
        }

    try:
        params = {'q': location, 'appid': WEATHER_API_KEY, 'units': 'metric'}
        response = requests.get(WEATHER_API_URL, params=params)
        response.raise_for_status()  # Raise an exception for bad status codes
        data = response.json()
        return {
            'location': data.get('name'),
            'temperature': data['main']['temp'],
            'condition': data['weather'][0]['main']
        }
    except requests.exceptions.RequestException as e:
        print(f"Error fetching weather data: {e}")
        # Return a default or error structure
        return {'location': location, 'error': 'Could not retrieve weather data'}

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