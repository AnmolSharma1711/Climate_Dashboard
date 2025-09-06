# Climate Dashboard 🌍

A comprehensive real-time climate monitoring dashboard that provides accurate weather data and air quality information for locations worldwide.

## ✨ Features

- **Real-time Weather Data**: Live weather information using WeatherAPI.com
- **Global Location Search**: Search any city worldwide with autocomplete
- **Current Location Detection**: GPS-based location detection
- **Accurate AQI Calculations**: EPA-standard Air Quality Index calculations for all major pollutants
- **Interactive Visualizations**: Charts and graphs using Recharts
- **Responsive Design**: Full-screen responsive layout with Bootstrap
- **Historical Data**: Access to historical weather patterns
- **Weather Forecasts**: Future weather predictions

## 🚀 Technology Stack

### Frontend
- **React** with Vite
- **Bootstrap 5** for responsive UI
- **Recharts** for data visualization
- **Leaflet** for interactive maps
- **Axios** for API communications
- **Font Awesome** for icons

### Backend
- **Flask** with CORS support
- **WeatherAPI.com** integration
- **EPA-standard AQI calculations**
- **Real-time data processing**

## 📊 Air Quality Index (AQI)

The dashboard calculates AQI using EPA standards for:
- **PM2.5** (Fine Particulate Matter)
- **PM10** (Coarse Particulate Matter)
- **NO2** (Nitrogen Dioxide)
- **SO2** (Sulfur Dioxide)
- **CO** (Carbon Monoxide)
- **O3** (Ozone)

### AQI Categories
- **0-50**: Good (Green)
- **51-100**: Moderate (Yellow)
- **101-150**: Unhealthy for Sensitive Groups (Orange)
- **151-200**: Unhealthy (Red)
- **201-300**: Very Unhealthy (Purple)
- **301+**: Hazardous (Maroon)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- WeatherAPI.com API key

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up WeatherAPI key in `app.py`:
   ```python
   WEATHER_API_KEY = "your_api_key_here"
   ```

4. Start the Flask server:
   ```bash
   python app.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend/climate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open http://localhost:5174 in your browser

## 🔧 Configuration

### WeatherAPI Setup
1. Sign up at [WeatherAPI.com](https://www.weatherapi.com/)
2. Get your free API key
3. Replace the API key in `backend/app.py`

### Environment Variables
Create a `.env` file in the backend directory:
```env
WEATHER_API_KEY=your_api_key_here
FLASK_ENV=development
```

## 📡 API Endpoints

- `GET /api/current?city={city}` - Current weather and AQI
- `GET /api/forecast?city={city}&days={days}` - Weather forecast
- `GET /api/search-locations?q={query}` - Location search
- `GET /api/cities` - Popular cities list

## 🌟 Key Features Explained

### Accurate AQI Calculations
The dashboard performs proper unit conversions from WeatherAPI's µg/m³ values to EPA-standard units:
- CO: µg/m³ → ppm conversion
- NO2, SO2, O3: µg/m³ → ppb conversion
- PM2.5, PM10: Direct µg/m³ usage

### Location Intelligence
- Global city search with autocomplete
- GPS-based current location detection
- Fallback to popular cities
- Country and region information

### Real-time Updates
- Live weather conditions
- Current air quality readings
- Automatic data refresh
- Error handling and fallbacks

## 🎯 Project Structure

```
Climate_Dashboard/
├── backend/
│   ├── app.py                 # Flask server with AQI calculations
│   ├── requirements.txt       # Python dependencies
│   └── data/
│       └── environment.csv    # Fallback data
├── frontend/climate/
│   ├── src/
│   │   ├── App.jsx           # Main application component
│   │   ├── components/
│   │   │   └── LocationSearch.jsx  # Location search component
│   │   └── assets/
│   ├── package.json          # Node.js dependencies
│   └── public/
└── README.md
```

## 🐛 Troubleshooting

### Common Issues
1. **AQI showing extreme values**: Ensure unit conversion is properly implemented
2. **Location not found**: Check WeatherAPI key and network connection
3. **CORS errors**: Verify Flask CORS configuration
4. **Port conflicts**: Change ports in configuration if needed

### Debug Mode
Enable debug logging in the backend to see detailed AQI calculations and API responses.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [WeatherAPI.com](https://www.weatherapi.com/) for weather data
- [EPA](https://www.epa.gov/) for AQI calculation standards
- React and Flask communities for excellent documentation

## 📞 Support

For issues and questions, please open an issue on GitHub or contact the maintainer.

---

**Built with ❤️ for better climate awareness**