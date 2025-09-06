from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import cohere
import datetime

from datetime import timedelta
import os
from dotenv import load_dotenv


load_dotenv()
app = Flask(__name__)
CORS(app)

"""
Gemini API configuration
You need to set your Gemini API key as an environment variable: GEMINI_API_KEY
Install the package: pip install google-generativeai
"""
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
print("COHERE_API_KEY loaded:", bool(COHERE_API_KEY))
cohere_client = None
if COHERE_API_KEY:
    cohere_client = cohere.Client(COHERE_API_KEY)
WEATHER_API_KEY = "12ec4534ab854fac9a945953250609"  # Replace with your actual API key
WEATHER_API_BASE_URL = "http://api.weatherapi.com/v1"

def calculate_aqi_from_pm25(pm25):
    """Calculate AQI from PM2.5 concentration using EPA standards"""
    if pm25 <= 12.0:
        return int(((50 - 0) / (12.0 - 0)) * (pm25 - 0) + 0)
    elif pm25 <= 35.4:
        return int(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51)
    elif pm25 <= 55.4:
        return int(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101)
    elif pm25 <= 150.4:
        return int(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151)
    elif pm25 <= 250.4:
        return int(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201)
    elif pm25 <= 350.4:
        return int(((400 - 301) / (350.4 - 250.5)) * (pm25 - 250.5) + 301)
    else:
        return int(((500 - 401) / (500.4 - 350.5)) * (pm25 - 350.5) + 401)

def calculate_aqi_from_pm10(pm10):
    """Calculate AQI from PM10 concentration using EPA standards"""
    if pm10 <= 54:
        return int(((50 - 0) / (54 - 0)) * (pm10 - 0) + 0)
    elif pm10 <= 154:
        return int(((100 - 51) / (154 - 55)) * (pm10 - 55) + 51)
    elif pm10 <= 254:
        return int(((150 - 101) / (254 - 155)) * (pm10 - 155) + 101)
    elif pm10 <= 354:
        return int(((200 - 151) / (354 - 255)) * (pm10 - 255) + 151)
    elif pm10 <= 424:
        return int(((300 - 201) / (424 - 355)) * (pm10 - 355) + 201)
    else:
        return int(((500 - 301) / (604 - 425)) * (pm10 - 425) + 301)

def calculate_aqi_from_no2(no2):
    """Calculate AQI from NO2 concentration (ppb)"""
    if no2 <= 53:
        return int(((50 - 0) / (53 - 0)) * (no2 - 0) + 0)
    elif no2 <= 100:
        return int(((100 - 51) / (100 - 54)) * (no2 - 54) + 51)
    elif no2 <= 360:
        return int(((150 - 101) / (360 - 101)) * (no2 - 101) + 101)
    elif no2 <= 649:
        return int(((200 - 151) / (649 - 361)) * (no2 - 361) + 151)
    elif no2 <= 1249:
        return int(((300 - 201) / (1249 - 650)) * (no2 - 650) + 201)
    else:
        return int(((500 - 301) / (2049 - 1250)) * (no2 - 1250) + 301)

def calculate_aqi_from_so2(so2):
    """Calculate AQI from SO2 concentration (ppb)"""
    if so2 <= 35:
        return int(((50 - 0) / (35 - 0)) * (so2 - 0) + 0)
    elif so2 <= 75:
        return int(((100 - 51) / (75 - 36)) * (so2 - 36) + 51)
    elif so2 <= 185:
        return int(((150 - 101) / (185 - 76)) * (so2 - 76) + 101)
    elif so2 <= 304:
        return int(((200 - 151) / (304 - 186)) * (so2 - 186) + 151)
    elif so2 <= 604:
        return int(((300 - 201) / (604 - 305)) * (so2 - 305) + 201)
    else:
        return int(((500 - 301) / (1004 - 605)) * (so2 - 605) + 301)

def calculate_aqi_from_co(co):
    """Calculate AQI from CO concentration (ppm)"""
    if co <= 4.4:
        return int(((50 - 0) / (4.4 - 0)) * (co - 0) + 0)
    elif co <= 9.4:
        return int(((100 - 51) / (9.4 - 4.5)) * (co - 4.5) + 51)
    elif co <= 12.4:
        return int(((150 - 101) / (12.4 - 9.5)) * (co - 9.5) + 101)
    elif co <= 15.4:
        return int(((200 - 151) / (15.4 - 12.5)) * (co - 12.5) + 151)
    elif co <= 30.4:
        return int(((300 - 201) / (30.4 - 15.5)) * (co - 15.5) + 201)
    else:
        return int(((500 - 301) / (50.4 - 30.5)) * (co - 30.5) + 301)

def calculate_aqi_from_o3(o3):
    """Calculate AQI from O3 concentration (ppb)"""
    if o3 <= 54:
        return int(((50 - 0) / (54 - 0)) * (o3 - 0) + 0)
    elif o3 <= 70:
        return int(((100 - 51) / (70 - 55)) * (o3 - 55) + 51)
    elif o3 <= 85:
        return int(((150 - 101) / (85 - 71)) * (o3 - 71) + 101)
    elif o3 <= 105:
        return int(((200 - 151) / (105 - 86)) * (o3 - 86) + 151)
    elif o3 <= 200:
        return int(((300 - 201) / (200 - 106)) * (o3 - 106) + 201)
    else:
        return max(301, min(500, int(((500 - 301) / (300 - 201)) * (o3 - 201) + 301)))

def calculate_comprehensive_aqi(air_quality, city_name="Unknown"):
    """Calculate AQI from ALL available pollutants with proper unit conversion"""
    aqi_values = []
    
    # Convert WeatherAPI units to EPA standard units before calculation
    # WeatherAPI returns: CO in µg/m³, NO2/SO2/O3 in µg/m³, PM2.5/PM10 in µg/m³
    
    # Get raw pollutant values
    pm25 = air_quality.get('pm2_5', 0)
    pm10 = air_quality.get('pm10', 0)
    no2_ugm3 = air_quality.get('no2', 0)
    so2_ugm3 = air_quality.get('so2', 0)
    co_ugm3 = air_quality.get('co', 0)
    o3_ugm3 = air_quality.get('o3', 0)
    
    print(f"Raw pollutant values for {city_name}:")
    print(f"PM2.5: {pm25} µg/m³, PM10: {pm10} µg/m³")
    print(f"NO2: {no2_ugm3} µg/m³, SO2: {so2_ugm3} µg/m³")
    print(f"CO: {co_ugm3} µg/m³, O3: {o3_ugm3} µg/m³")
    
    # Calculate AQI from each available pollutant with unit conversion
    
    # PM2.5 (µg/m³ - correct unit)
    if pm25 > 0:
        aqi_pm25 = calculate_aqi_from_pm25(pm25)
        aqi_values.append(aqi_pm25)
        print(f"AQI from PM2.5 ({pm25} µg/m³): {aqi_pm25}")
    
    # PM10 (µg/m³ - correct unit)
    if pm10 > 0:
        aqi_pm10 = calculate_aqi_from_pm10(pm10)
        aqi_values.append(aqi_pm10)
        print(f"AQI from PM10 ({pm10} µg/m³): {aqi_pm10}")
    
    # NO2 (convert from µg/m³ to ppb: µg/m³ * 0.532 = ppb)
    if no2_ugm3 > 0:
        no2_ppb = no2_ugm3 * 0.532  # Conversion factor for NO2
        aqi_no2 = calculate_aqi_from_no2(no2_ppb)
        aqi_values.append(aqi_no2)
        print(f"AQI from NO2 ({no2_ugm3} µg/m³ = {no2_ppb:.1f} ppb): {aqi_no2}")
    
    # SO2 (convert from µg/m³ to ppb: µg/m³ * 0.382 = ppb)
    if so2_ugm3 > 0:
        so2_ppb = so2_ugm3 * 0.382  # Conversion factor for SO2
        aqi_so2 = calculate_aqi_from_so2(so2_ppb)
        aqi_values.append(aqi_so2)
        print(f"AQI from SO2 ({so2_ugm3} µg/m³ = {so2_ppb:.1f} ppb): {aqi_so2}")
    
    # CO (convert from µg/m³ to ppm: µg/m³ * 0.000873 = ppm)
    if co_ugm3 > 0:
        co_ppm = co_ugm3 * 0.000873  # Conversion factor for CO
        aqi_co = calculate_aqi_from_co(co_ppm)
        aqi_values.append(aqi_co)
        print(f"AQI from CO ({co_ugm3} µg/m³ = {co_ppm:.2f} ppm): {aqi_co}")
    
    # O3 (convert from µg/m³ to ppb: µg/m³ * 0.510 = ppb)
    if o3_ugm3 > 0:
        o3_ppb = o3_ugm3 * 0.510  # Conversion factor for O3
        aqi_o3 = calculate_aqi_from_o3(o3_ppb)
        aqi_values.append(aqi_o3)
        print(f"AQI from O3 ({o3_ugm3} µg/m³ = {o3_ppb:.1f} ppb): {aqi_o3}")
    
    # If we have calculated values, return the maximum (worst air quality)
    if aqi_values:
        final_aqi = max(aqi_values)
        print(f"Final AQI (max of {aqi_values}): {final_aqi}")
        return final_aqi
    
    # If no pollutant data available, estimate based on city characteristics
    city_lower = city_name.lower()
    
    # Major polluted cities (higher baseline AQI)
    if any(city in city_lower for city in ['delhi', 'beijing', 'mumbai', 'dhaka', 'lahore', 'kolkata']):
        estimated_aqi = 120 + (hash(city_name) % 50)  # 120-170 range
    # Large industrial cities
    if any(city in city_lower for city in ['delhi', 'beijing', 'mumbai', 'dhaka', 'lahore', 'kolkata']):
        estimated_aqi = 120 + (hash(city_name) % 50)  # 120-170 range
    # Large industrial cities
    elif any(city in city_lower for city in ['los angeles', 'mexico city', 'shanghai', 'tehran', 'cairo']):
        estimated_aqi = 80 + (hash(city_name) % 40)   # 80-120 range
    # Medium cities
    elif any(city in city_lower for city in ['new york', 'london', 'paris', 'tokyo', 'sydney']):
        estimated_aqi = 45 + (hash(city_name) % 35)   # 45-80 range
    # Clean/coastal cities
    elif any(city in city_lower for city in ['reykjavik', 'wellington', 'vancouver', 'zurich']):
        estimated_aqi = 25 + (hash(city_name) % 25)   # 25-50 range
    else:
        # Default for unknown cities
        estimated_aqi = 55 + (hash(city_name) % 30)   # 55-85 range
    
    print(f"No pollutant data available for {city_name}, using city-based estimate: {estimated_aqi}")
    return max(25, min(200, estimated_aqi))  # Ensure reasonable range

def calculate_aqi_from_pollutants(air_quality):
    """Legacy function for backward compatibility"""
    return calculate_comprehensive_aqi(air_quality)

def get_current_weather_and_aqi(city="London"):
    """Get current weather and air quality data for a city"""
    try:
        url = f"{WEATHER_API_BASE_URL}/current.json"
        params = {
            'key': WEATHER_API_KEY,
            'q': city,
            'aqi': 'yes'  # Enable air quality data
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        # Extract relevant data
        location = data['location']
        current = data['current']
        air_quality = current.get('air_quality', {})
        
        # DEBUG: Print raw air quality data
        print(f"\n=== DEBUG: Raw air quality data for {location['name']} ===")
        print(f"Full air_quality object: {air_quality}")
        print(f"Available keys: {list(air_quality.keys()) if air_quality else 'No air quality data'}")
        
        # Calculate AQI with comprehensive fallback logic
        api_aqi = air_quality.get('us-epa-index', 0)
        print(f"API us-epa-index: {api_aqi}")
        
        if api_aqi and api_aqi > 10:  # Only trust API AQI if it's reasonable
            calculated_aqi = api_aqi
            print(f"Using API AQI for {location['name']}: {api_aqi}")
        else:
            # Calculate from ALL available pollutants
            calculated_aqi = calculate_comprehensive_aqi(air_quality, location['name'])
            print(f"Calculated comprehensive AQI for {location['name']}: {calculated_aqi}")
        
        print(f"=== END DEBUG ===\n")
        
        return {
            'city': location['name'],
            'country': location['country'],
            'latitude': location['lat'],
            'longitude': location['lon'],
            'date': current['last_updated'],
            'temperature': current['temp_c'],
            'humidity': current['humidity'],
            'rainfall': current.get('precip_mm', 0),
            'condition': current['condition']['text'],
            'wind_speed': current['wind_kph'],
            'pressure': current['pressure_mb'],
            'uv_index': current['uv'],
            # Air Quality Data
            'AQI': calculated_aqi,
            'PM2.5': air_quality.get('pm2_5', 0),
            'PM10': air_quality.get('pm10', 0),
            'NO2': air_quality.get('no2', 0),
            'SO2': air_quality.get('so2', 0),
            'CO': air_quality.get('co', 0),
            'O3': air_quality.get('o3', 0)
        }
    except Exception as e:
        print(f"Error fetching current weather: {e}")
        return None

def get_historical_weather_and_aqi(city="London", days=7):
    """Get historical weather and air quality data for specified days"""
    try:
        historical_data = []
        
        for i in range(days):
            date = (datetime.datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            
            url = f"{WEATHER_API_BASE_URL}/history.json"
            params = {
                'key': WEATHER_API_KEY,
                'q': city,
                'dt': date,
                'aqi': 'yes'
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            location = data['location']
            day_data = data['forecast']['forecastday'][0]['day']
            air_quality = day_data.get('air_quality', {})
            
            # Calculate AQI with comprehensive fallback logic
            api_aqi = air_quality.get('us-epa-index', 0)
            if api_aqi and api_aqi > 10:  # Only trust API AQI if it's reasonable
                calculated_aqi = api_aqi
            else:
                # Calculate from ALL available pollutants
                calculated_aqi = calculate_comprehensive_aqi(air_quality, location['name'])
            
            historical_data.append({
                'city': location['name'],
                'country': location['country'],
                'latitude': location['lat'],
                'longitude': location['lon'],
                'date': date,
                'temperature': day_data['avgtemp_c'],
                'humidity': day_data['avghumidity'],
                'rainfall': day_data.get('totalprecip_mm', 0),
                'condition': day_data['condition']['text'],
                'max_temp': day_data['maxtemp_c'],
                'min_temp': day_data['mintemp_c'],
                'uv_index': day_data['uv'],
                # Air Quality Data
                'AQI': calculated_aqi,
                'PM2.5': air_quality.get('pm2_5', 0),
                'PM10': air_quality.get('pm10', 0),
                'NO2': air_quality.get('no2', 0),
                'SO2': air_quality.get('so2', 0),
                'CO': air_quality.get('co', 0),
                'O3': air_quality.get('o3', 0)
            })
            
        # Sort data chronologically (oldest to newest) for proper chart display
        historical_data.sort(key=lambda x: x['date'])
        return historical_data
    except Exception as e:
        print(f"Error fetching historical weather: {e}")
        return []

def get_forecast_weather_and_aqi(city="London", days=3):
    """Get weather forecast with air quality for next few days"""
    try:
        url = f"{WEATHER_API_BASE_URL}/forecast.json"
        params = {
            'key': WEATHER_API_KEY,
            'q': city,
            'days': days,
            'aqi': 'yes',
            'alerts': 'no'
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        location = data['location']
        forecast_data = []
        
        for day in data['forecast']['forecastday']:
            day_data = day['day']
            air_quality = day_data.get('air_quality', {})
            
            # Calculate AQI with comprehensive fallback logic
            api_aqi = air_quality.get('us-epa-index', 0)
            if api_aqi and api_aqi > 10:  # Only trust API AQI if it's reasonable
                calculated_aqi = api_aqi
            else:
                # Calculate from ALL available pollutants
                calculated_aqi = calculate_comprehensive_aqi(air_quality, location['name'])
            
            forecast_data.append({
                'city': location['name'],
                'country': location['country'],
                'latitude': location['lat'],
                'longitude': location['lon'],
                'date': day['date'],
                'temperature': day_data['avgtemp_c'],
                'humidity': day_data['avghumidity'],
                'rainfall': day_data.get('totalprecip_mm', 0),
                'condition': day_data['condition']['text'],
                'max_temp': day_data['maxtemp_c'],
                'min_temp': day_data['mintemp_c'],
                'uv_index': day_data['uv'],
                # Air Quality Data
                'AQI': calculated_aqi,
                'PM2.5': air_quality.get('pm2_5', 0),
                'PM10': air_quality.get('pm10', 0),
                'NO2': air_quality.get('no2', 0),
                'SO2': air_quality.get('so2', 0),
                'CO': air_quality.get('co', 0),
                'O3': air_quality.get('o3', 0)
            })
            
        return forecast_data
    except Exception as e:
        print(f"Error fetching forecast: {e}")
        return []

@app.route('/api/data')
def get_climate_data():
    """Get combined historical and current climate data"""
    city = request.args.get('city', 'London')
    days = int(request.args.get('days', 7))
    
    try:
        # Get historical data
        historical_data = get_historical_weather_and_aqi(city, days)
        
        # Get current data
        current_data = get_current_weather_and_aqi(city)
        
        # Combine data
        all_data = historical_data
        if current_data:
            all_data.append(current_data)
        
        # Ensure chronological order (oldest to newest)
        all_data.sort(key=lambda x: x['date'])
        
        return jsonify(all_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/current')
def get_current_data():
    """Get current weather and air quality data"""
    city = request.args.get('city', 'London')
    
    try:
        data = get_current_weather_and_aqi(city)
        if data:
            return jsonify(data)
        else:
            return jsonify({'error': 'Failed to fetch current data'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/forecast')
def get_forecast_data():
    """Get weather forecast with air quality"""
    city = request.args.get('city', 'London')
    days = int(request.args.get('days', 3))
    
    try:
        data = get_forecast_weather_and_aqi(city, days)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/summary')
def get_summary():
    """Generate summary based on current data"""
    city = request.args.get('city', 'London')
    
    try:
        current_data = get_current_weather_and_aqi(city)
        historical_data = get_historical_weather_and_aqi(city, 7)
        
        if current_data and historical_data:
            avg_temp = sum(day['temperature'] for day in historical_data) / len(historical_data)
            avg_rainfall = sum(day['rainfall'] for day in historical_data) / len(historical_data)
            avg_aqi = sum(day['AQI'] for day in historical_data if day['AQI'] > 0) / max(1, len([d for d in historical_data if d['AQI'] > 0]))
            
            # AQI interpretation
            if avg_aqi <= 50:
                aqi_status = "good air quality"
            elif avg_aqi <= 100:
                aqi_status = "moderate air quality"
            elif avg_aqi <= 150:
                aqi_status = "unhealthy for sensitive groups"
            elif avg_aqi <= 200:
                aqi_status = "unhealthy air quality"
            else:
                aqi_status = "very unhealthy air quality"
            
            # Compose a prompt for Cohere
            prompt = (
                f"Weather data for {current_data['city']}:\n"
                f"Current temperature: {current_data['temperature']}°C\n"
                f"7-day average temperature: {avg_temp:.1f}°C\n"
                f"Average rainfall: {avg_rainfall:.2f}mm\n"
                f"Current AQI: {current_data['AQI']} ({aqi_status})\n"
                "Give a short, friendly one-line summary of the weather and air quality for local residents. "
                "Then, in a separate line, give a creative, actionable recommendation for what people can do today based on the weather (e.g., 'It's rainy—enjoy tea and pakodas with family!'). "
                "Keep both lines concise and engaging."
            )
            cohere_summary = None
            if cohere_client:
                try:
                    response = cohere_client.generate(
                        model="command",
                        prompt=prompt,
                        max_tokens=300,
                        temperature=0.7
                    )
                    cohere_summary = response.generations[0].text.strip()
                except Exception as ce:
                    print(f"Cohere API error: {ce}")
                    cohere_summary = None
            # Fallback to basic summary if Cohere fails
            if cohere_summary:
                summary = cohere_summary
            else:
                summary = (
                    f"Current temperature in {current_data['city']} is {current_data['temperature']}°C. "
                    f"7-day average temperature is {avg_temp:.1f}°C. "
                    f"Average rainfall is {avg_rainfall:.2f}mm. "
                    f"Current AQI is {current_data['AQI']}, indicating {aqi_status}."
                )
            return jsonify({'summary': summary})
        else:
            return jsonify({'summary': 'Unable to generate summary at this time.'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/anomalies')
def get_anomalies():
    """Detect temperature anomalies in historical data"""
    city = request.args.get('city', 'London')
    
    try:
        historical_data = get_historical_weather_and_aqi(city, 30)  # Get 30 days for better anomaly detection
        
        if len(historical_data) < 5:
            return jsonify([])
            
        temperatures = [day['temperature'] for day in historical_data]
        avg_temp = sum(temperatures) / len(temperatures)
        
        # Calculate standard deviation
        variance = sum((temp - avg_temp) ** 2 for temp in temperatures) / len(temperatures)
        std_dev = variance ** 0.5
        
        # Find anomalies (temperatures more than 2 standard deviations from mean)
        anomalies = []
        for day in historical_data:
            if abs(day['temperature'] - avg_temp) > 2 * std_dev:
                anomalies.append({
                    'date': day['date'],
                    'temperature': day['temperature'],
                    'deviation': abs(day['temperature'] - avg_temp)
                })
                
        return jsonify(anomalies)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/search-locations')
def search_locations():
    """Search for locations using WeatherAPI search"""
    query = request.args.get('q', '')
    
    if not query or len(query) < 2:
        return jsonify([])
    
    try:
        url = f"{WEATHER_API_BASE_URL}/search.json"
        params = {
            'key': WEATHER_API_KEY,
            'q': query
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        # Format the response for frontend
        locations = []
        for location in data[:10]:  # Limit to 10 results
            locations.append({
                'name': location['name'],
                'country': location['country'],
                'region': location.get('region', ''),
                'lat': location['lat'],
                'lon': location['lon'],
                'display_name': f"{location['name']}, {location.get('region', '')}, {location['country']}"
            })
            
        return jsonify(locations)
    except Exception as e:
        print(f"Error searching locations: {e}")
        return jsonify([])

@app.route('/api/cities')
def get_cities():
    """Get popular cities for selection"""
    cities = [
        {'name': 'London', 'country': 'UK'},
        {'name': 'New York', 'country': 'USA'},
        {'name': 'Tokyo', 'country': 'Japan'},
        {'name': 'Delhi', 'country': 'India'},
        {'name': 'Mumbai', 'country': 'India'},
        {'name': 'Beijing', 'country': 'China'},
        {'name': 'Los Angeles', 'country': 'USA'},
        {'name': 'Paris', 'country': 'France'},
        {'name': 'Sydney', 'country': 'Australia'},
        {'name': 'Dubai', 'country': 'UAE'}
    ]
    return jsonify(cities)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
