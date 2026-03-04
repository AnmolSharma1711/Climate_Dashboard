# 🎉 Climate Dashboard - Setup Complete!

Your Climate Dashboard project is now working! Here's what was fixed and how to use it.

## ✅ What Was Fixed

### 1. Backend Setup
- ✅ Created `.env` file in `backend/` directory for API keys
- ✅ Fixed `requirements.txt` (changed `dotenv` to `python-dotenv`)
- ✅ Created Python virtual environment (`venv`)
- ✅ Installed all required Python packages:
  - Flask, Flask-CORS
  - Pandas, NumPy
  - Requests, python-dotenv
  - Cohere (for AI summaries)
  - Gunicorn

### 2. Frontend Setup
- ✅ Downgraded packages for Node.js 18 compatibility:
  - Vite: 7.x → 5.x
  - React: 19.x → 18.x
  - React Router: 7.x → 6.x
  - React Leaflet: 5.x → 4.x
  - Recharts: 3.x → 2.x
- ✅ Removed incompatible ESLint dependencies
- ✅ Installed all frontend dependencies

### 3. Servers Running
- ✅ **Backend**: http://127.0.0.1:5000
- ✅ **Frontend**: http://localhost:5173

## 🚀 How to Use

### Starting the Application

**Backend Server:**
```powershell
cd d:\Mausam
.\venv\Scripts\Activate.ps1
cd Climate_Dashboard\backend
python app.py
```

**Frontend Server (in a new terminal):**
```powershell
cd d:\Mausam\Climate_Dashboard\frontend\climate
npm start
```

Then open your browser and go to: **http://localhost:5173**

### 🔑 Important: Add Your API Keys

Before using the app, you need to add your API keys to the `.env` file:

1. Get a **free** WeatherAPI key from [weatherapi.com](https://www.weatherapi.com/)
2. (Optional) Get a Cohere API key from [cohere.com](https://cohere.com/)
3. Edit `backend/.env` and replace the placeholder keys:

```env
WEATHER_API_KEY=your_actual_weather_api_key_here
COHERE_API_KEY=your_actual_cohere_api_key_here
```

Without the WeatherAPI key, the app won't be able to fetch weather data.

## 📦 Quick Commands

### Backend
```powershell
# Activate virtual environment
cd d:\Mausam
.\venv\Scripts\Activate.ps1

# Start backend server
cd Climate_Dashboard\backend
python app.py
```

### Frontend
```powershell
# Start frontend server
cd d:\Mausam\Climate_Dashboard\frontend\climate
npm start
```

### Install New Packages
```powershell
# Backend
cd d:\Mausam
.\venv\Scripts\Activate.ps1
pip install package_name

# Frontend
cd d:\Mausam\Climate_Dashboard\frontend\climate
npm install package_name
```

## 🌟 Features

- **Real-time Weather Data**: Live weather information using WeatherAPI
- **Global Location Search**: Search any city worldwide
- **Current Location Detection**: GPS-based location detection
- **Air Quality Index (AQI)**: Real-time air quality data
- **Interactive Maps**: Leaflet-based interactive maps
- **Data Visualizations**: Charts using Recharts
- **Historical Weather**: Access past weather patterns
- **Weather Forecasts**: Future weather predictions

## 🔧 Troubleshooting

### Backend won't start:
- Make sure virtual environment is activated
- Check that all packages are installed: `pip list`
- Verify `.env` file exists in `backend/` directory

### Frontend won't start:
- Ensure you're in the correct directory
- Delete `node_modules` and run `npm install` again
- Check Node.js version: `node --version` (should be v18.x)

### No data showing:
- Add your WeatherAPI key to the `.env` file
- Restart the backend server after adding the key
- Check backend console for error messages

## 📝 Development Notes

- Backend runs on port **5000**
- Frontend runs on port **5173**
- Both servers must be running for the app to work
- The backend API endpoints are:
  - `/api/data?city=London&days=14` - Historical data
  - `/api/current?city=London` - Current weather
  - `/api/forecast?city=London&days=3` - Forecast
  - `/api/summary?city=London` - AI summary (requires Cohere API)
  - `/api/anomalies?city=London` - Temperature anomalies
  - `/api/cities` - List of cities

## ⚠️ Important Notes

1. **Node.js Version**: Currently using Node.js v18.20.8
   - To use the latest packages, consider upgrading to Node.js 20+ or 22+
   - Current setup uses compatible versions with Node 18

2. **API Keys**: The app requires a WeatherAPI key to function
   - Free tier provides 1 million calls/month
   - Includes current weather, 3-day forecast, and air quality data

3. **Virtual Environment**: Always activate `venv` before running backend
   - Windows: `.\venv\Scripts\Activate.ps1`
   - You'll see `(venv)` in your terminal prompt when activated

## 🎯 Next Steps

1. **Add API Keys**: Get your free WeatherAPI key and add it to `.env`
2. **Test the App**: Open http://localhost:5173 in your browser
3. **Explore Features**: Try searching different cities, viewing historical data
4. **Customize**: Modify the code to add your own features!

Enjoy your Climate Dashboard! 🌍🌤️
