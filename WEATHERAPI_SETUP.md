# WeatherAPI Setup Instructions

## 🚀 How to Set Up WeatherAPI Integration

### Step 1: Get Your WeatherAPI Key
1. Go to [WeatherAPI.com](https://www.weatherapi.com/)
2. Sign up for a free account
3. Go to your dashboard and copy your API key
4. The free plan includes:
   - Current weather data
   - 3-day weather forecast
   - Historical weather data (last 7 days)
   - Air quality data
   - 1 million calls/month

### Step 2: Configure Your API Key
1. Open `backend/app_weatherapi.py`
2. Find the line: `WEATHER_API_KEY = "YOUR_API_KEY_HERE"`
3. Replace `"YOUR_API_KEY_HERE"` with your actual API key

### Step 3: Switch to WeatherAPI Backend
1. Rename your current `app.py` to `app_csv_backup.py`
2. Rename `app_weatherapi.py` to `app.py`
3. Similarly, rename your frontend files:
   - Rename `App.jsx` to `App_csv_backup.jsx`
   - Rename `App_weatherapi.jsx` to `App.jsx`

### Step 4: Run the Application
1. Start the backend: `python app.py`
2. Start the frontend: `npm start`

## 🌟 Features You'll Get

### Real-time Data:
- ✅ Current weather conditions
- ✅ Live air quality index (AQI) - current only
- ✅ Real-time PM2.5, PM10, NO2, SO2, CO, O3 levels - current only
- ✅ Temperature, humidity, rainfall
- ✅ Wind speed, pressure, UV index

### Historical Data:
- ✅ Weather history for the last 7-30 days
- ❌ Historical air quality data (not provided by WeatherAPI)
- ✅ Temperature trends and anomaly detection

### Forecast Data:
- ✅ 3-day weather forecast
- ✅ Predicted air quality levels

### Multiple Cities:
- ✅ Switch between 10+ popular cities
- ✅ London, New York, Tokyo, Delhi, Mumbai, etc.
- ✅ Real coordinates for accurate mapping

### Enhanced Visualizations:
- ✅ Color-coded current AQI indicators
- ✅ Interactive weather trend charts
- ✅ Current weather dashboard with detailed air quality
- ✅ Historical temperature and rainfall charts

## 🔧 API Endpoints Available

- `/api/data?city=London&days=14` - Historical data
- `/api/current?city=London` - Current weather
- `/api/forecast?city=London&days=3` - Weather forecast
- `/api/summary?city=London` - Generated summary
- `/api/anomalies?city=London` - Temperature anomalies
- `/api/cities` - Available cities list

## 🎯 Benefits Over CSV Data

1. **Real-time Updates**: Live weather data instead of static CSV
2. **Global Coverage**: Any city worldwide
3. **Current Air Quality**: Real-time AQI and pollutant measurements (current only)
4. **Rich Weather Data**: 20+ weather parameters with historical trends
5. **No Data Limits**: Always up-to-date weather information
6. **Professional APIs**: Reliable, fast, and accurate

**Important Note**: While WeatherAPI provides excellent current air quality data, historical AQI trends are not available. The dashboard focuses on current air quality status and historical weather patterns.

## 📊 Air Quality Index (AQI) Scale

- **0-50**: Good (Green)
- **51-100**: Moderate (Yellow) 
- **101-150**: Unhealthy for Sensitive Groups (Orange)
- **151-200**: Unhealthy (Red)
- **201-300**: Very Unhealthy (Purple)
- **301+**: Hazardous (Maroon)

## 🔥 Next Steps After Setup

Once you have the WeatherAPI working, we can add:
1. **Real-time Auto-refresh**: Update data every 5 minutes
2. **Location Detection**: Get user's current location
3. **Weather Alerts**: Notifications for severe weather
4. **Historical Analysis**: Compare multiple time periods
5. **Export Features**: Download data as CSV/PDF
6. **Mobile Responsive**: Perfect mobile experience

Let me know when you've set up your API key and we can continue with more advanced features!
