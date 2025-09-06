import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import LocationSearch from "./components/LocationSearch";
import DateRangeSelector from "./components/DateRangeSelector";

// Recharts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer
} from "recharts";

// Leaflet
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Map control component to handle automatic navigation
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  React.useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 6, {
        animate: true,
        duration: 1.5
      });
    }
  }, [map, center, zoom]);
  
  return null;
};

// Map click handler component
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    }
  });
  
  return null;
};

function App() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState("");
  const [anomalies, setAnomalies] = useState([]);
  const [selectedCity, setSelectedCity] = useState("London");
  const [selectedDateRange, setSelectedDateRange] = useState(7); // Default to 7 days
  const [loading, setLoading] = useState(false);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [mapCenter, setMapCenter] = useState([20, 0]); // Default world center
  const [mapZoom, setMapZoom] = useState(2);
  const [mapClickLoading, setMapClickLoading] = useState(false);

  // Fetch data for selected city and date range
  const fetchDataForCity = async (city, days = selectedDateRange) => {
    setLoading(true);
    try {
      // Fetch historical data with specified days
      const dataRes = await axios.get(`http://127.0.0.1:5000/api/data?city=${city}&days=${days}`);
      setData(dataRes.data);

      // Fetch current weather
      const currentRes = await axios.get(`http://127.0.0.1:5000/api/current?city=${city}`);
      setCurrentWeather(currentRes.data);

      // Fetch summary
      const summaryRes = await axios.get(`http://127.0.0.1:5000/api/summary?city=${city}`);
      setSummary(summaryRes.data.summary);

      // Fetch anomalies
      const anomaliesRes = await axios.get(`http://127.0.0.1:5000/api/anomalies?city=${city}`);
      setAnomalies(anomaliesRes.data);

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when city or date range changes
  useEffect(() => {
    if (selectedCity) {
      fetchDataForCity(selectedCity, selectedDateRange);
    }
  }, [selectedCity, selectedDateRange]);

  const handleLocationSelect = (cityName) => {
    setSelectedCity(cityName);
  };

  const handleLocationCoordinates = (coordinates) => {
    if (coordinates && coordinates[0] && coordinates[1]) {
      setMapCenter(coordinates);
      setMapZoom(6);
    }
  };

  // Update map center when current weather data is fetched
  useEffect(() => {
    if (currentWeather && currentWeather.latitude && currentWeather.longitude) {
      setMapCenter([currentWeather.latitude, currentWeather.longitude]);
      setMapZoom(6); // Zoom to city level
    }
  }, [currentWeather]);

  // Handle map click to get location details
  const handleMapClick = async (lat, lng) => {
    setMapClickLoading(true);
    try {
      // Use reverse geocoding with coordinates
      const coords = `${lat},${lng}`;
      console.log(`Map clicked at coordinates: ${coords}`);
      
      // Fetch current weather data for the clicked coordinates
      const response = await axios.get(`http://127.0.0.1:5000/api/current?city=${coords}`);
      
      if (response.data && response.data.city) {
        const locationName = response.data.city;
        setSelectedCity(locationName);
        setCurrentWeather(response.data);
        setMapCenter([lat, lng]);
        setMapZoom(8);
        
        // Also fetch historical data for the new location
        fetchDataForCity(locationName, selectedDateRange);
      }
    } catch (error) {
      console.error("Error fetching location data from map click:", error);
      alert("Could not get location details for this area. Please try clicking on a populated area or use the search bar.");
    } finally {
      setMapClickLoading(false);
    }
  };

  const handleDateRangeChange = (days) => {
    setSelectedDateRange(days);
  };

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return "#00e400"; // Good - Green
    if (aqi <= 100) return "#ffff00"; // Moderate - Yellow
    if (aqi <= 150) return "#ff7e00"; // Unhealthy for Sensitive Groups - Orange
    if (aqi <= 200) return "#ff0000"; // Unhealthy - Red
    if (aqi <= 300) return "#8f3f97"; // Very Unhealthy - Purple
    return "#7e0023"; // Hazardous - Maroon
  };

  const getAQILabel = (aqi) => {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
  };

  // Format date for chart display
  const formatDate = (dateString, isCurrentData = false) => {
    if (!dateString) return '';
    
    // If this is explicitly marked as current data or has time component, show as "NOW"
    if (isCurrentData || (dateString.includes(':') && dateString.includes(' '))) {
      return 'NOW';
    }
    
    // Handle date format: "2025-09-02"
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    // Return short format: "Sep 2"
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Process data to format dates for charts
  const processedData = data.map((item, index) => {
    // Any item with both date and time (contains ':' and ' ') is current data
    const hasDateTime = item.date && item.date.includes(':') && item.date.includes(' ');
    
    // Debug logging for the last few items
    if (index >= data.length - 2) {
      console.log(`Item ${index}: date="${item.date}", hasDateTime=${hasDateTime}`);
    }
    
    return {
      ...item,
      formattedDate: formatDate(item.date, hasDateTime)
    };
  });

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark mb-4">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">🌍 Climate Data Visual Explorer</span>
          <div className="d-flex align-items-center">
            <LocationSearch 
              onLocationSelect={handleLocationSelect}
              onLocationCoordinates={handleLocationCoordinates}
              currentLocation={selectedCity}
            />
          </div>
        </div>
      </nav>

      <div className="px-3">
        {/* Current Weather Card */}
        {currentWeather && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h5 className="card-title">Current Weather in {currentWeather.city}</h5>
                  <div className="row">
                    <div className="col-md-3">
                      <h3>{currentWeather.temperature}°C</h3>
                      <p className="mb-1">{currentWeather.condition}</p>
                      <small>Humidity: {currentWeather.humidity}%</small>
                    </div>
                    <div className="col-md-3">
                      <h5>Air Quality</h5>
                      <span 
                        className="badge fs-6 mb-2" 
                        style={{backgroundColor: getAQIColor(currentWeather.AQI)}}
                      >
                        AQI: {currentWeather.AQI} - {getAQILabel(currentWeather.AQI)}
                      </span>
                      <div className="small">
                        <div>PM2.5: {currentWeather['PM2.5']} μg/m³</div>
                        <div>PM10: {currentWeather.PM10} μg/m³</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <h6>Weather Details</h6>
                      <p className="mb-1">Wind: {currentWeather.wind_speed} km/h</p>
                      <p className="mb-1">Pressure: {currentWeather.pressure} mb</p>
                      <p className="mb-1">UV Index: {currentWeather.uv_index}</p>
                    </div>
                    <div className="col-md-3">
                      <h6>Other Pollutants</h6>
                      <p className="mb-1">NO2: {currentWeather.NO2} μg/m³</p>
                      <p className="mb-1">SO2: {currentWeather.SO2} μg/m³</p>
                      <p className="mb-1">CO: {currentWeather.CO} μg/m³</p>
                      <p className="mb-1">O3: {currentWeather.O3} μg/m³</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="alert alert-info">
          <h5>Summary</h5>
          <p>{summary || "Loading summary..."}</p>
        </div>

        {/* Date Range Selector */}
        <DateRangeSelector
          selectedRange={selectedDateRange}
          onRangeChange={handleDateRangeChange}
          loading={loading}
        />

        {/* Charts Section */}
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Temperature Trend (Past {selectedDateRange} days)</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="formattedDate" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="temperature" stroke="#ff7300" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Rainfall (Past {selectedDateRange} days)</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="formattedDate" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rainfall" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Current Air Quality Components */}
        {currentWeather && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card bg-light">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fas fa-wind me-2"></i>
                    Current Air Quality in {currentWeather.city}
                  </h5>
                  <div className="row">
                    {/* AQI Overall */}
                    <div className="col-md-3 text-center">
                      <div className="p-3 rounded" style={{backgroundColor: getAQIColor(currentWeather.AQI)}}>
                        <h3 className="text-white mb-1">{currentWeather.AQI}</h3>
                        <span className="text-white fw-bold">{getAQILabel(currentWeather.AQI)}</span>
                      </div>
                      <small className="text-muted mt-2 d-block">Air Quality Index</small>
                    </div>
                    
                    {/* Particulate Matter */}
                    <div className="col-md-3">
                      <h6 className="mb-3">Particulate Matter</h6>
                      <div className="mb-2">
                        <span className="badge bg-danger me-2">PM2.5</span>
                        <strong>{currentWeather['PM2.5']}</strong> <small className="text-muted">μg/m³</small>
                      </div>
                      <div>
                        <span className="badge bg-warning me-2">PM10</span>
                        <strong>{currentWeather.PM10}</strong> <small className="text-muted">μg/m³</small>
                      </div>
                    </div>
                    
                    {/* Gases */}
                    <div className="col-md-3">
                      <h6 className="mb-3">Nitrogen & Sulfur</h6>
                      <div className="mb-2">
                        <span className="badge bg-info me-2">NO₂</span>
                        <strong>{currentWeather.NO2}</strong> <small className="text-muted">μg/m³</small>
                      </div>
                      <div>
                        <span className="badge bg-secondary me-2">SO₂</span>
                        <strong>{currentWeather.SO2}</strong> <small className="text-muted">μg/m³</small>
                      </div>
                    </div>
                    
                    {/* Other Pollutants */}
                    <div className="col-md-3">
                      <h6 className="mb-3">Other Pollutants</h6>
                      <div className="mb-2">
                        <span className="badge bg-dark me-2">CO</span>
                        <strong>{currentWeather.CO}</strong> <small className="text-muted">μg/m³</small>
                      </div>
                      <div>
                        <span className="badge bg-success me-2">O₃</span>
                        <strong>{currentWeather.O3}</strong> <small className="text-muted">μg/m³</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced World Map */}
        <div className="mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-globe me-2"></i>
                Global Climate Monitor
                {currentWeather && (
                  <span className="ms-2 text-muted small">
                    📍 {currentWeather.city}, {currentWeather.country}
                  </span>
                )}
                {mapClickLoading && (
                  <span className="ms-2">
                    <i className="fas fa-spinner fa-spin text-primary"></i>
                    <small className="text-primary ms-1">Getting location data...</small>
                  </span>
                )}
              </h5>
              
              {/* Earth-like spherical map container */}
              <div 
                className="map-earth-container"
                style={{
                  height: "500px", 
                  width: "100%",
                  borderRadius: "50%", // Makes it oval/circular
                  overflow: "hidden",
                  border: "8px solid #1e3a8a",
                  boxShadow: "0 0 30px rgba(30, 58, 138, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.2)",
                  background: "linear-gradient(45deg, #1e40af, #3b82f6)",
                  position: "relative"
                }}
              >
                {/* Atmospheric glow effect */}
                <div 
                  style={{
                    position: "absolute",
                    top: "-10px",
                    left: "-10px",
                    right: "-10px", 
                    bottom: "-10px",
                    borderRadius: "50%",
                    background: "radial-gradient(ellipse at center, rgba(59, 130, 246, 0.3) 0%, rgba(30, 64, 175, 0.1) 70%, transparent 100%)",
                    pointerEvents: "none",
                    zIndex: 1000
                  }}
                />
                
                <MapContainer 
                  center={mapCenter} 
                  zoom={mapZoom} 
                  style={{ 
                    height: "100%", 
                    width: "100%",
                    borderRadius: "50%",
                    cursor: "crosshair" // Pin cursor for clicking
                  }}
                  worldCopyJump={true} // Enables horizontal scrolling around the world
                  maxBounds={[[-90, -180], [90, 180]]} // World bounds
                  maxBoundsViscosity={1.0}
                  minZoom={2}
                  maxZoom={18}
                  scrollWheelZoom={true}
                  dragging={true}
                  doubleClickZoom={true}
                  attributionControl={false} // Clean look
                >
                  {/* Satellite/Terrain tile layer for realistic Earth appearance */}
                  <TileLayer 
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                  />
                  
                  {/* Alternative beautiful map style */}
                  <TileLayer 
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    opacity={0.7} // Blend with satellite
                  />
                  
                  {/* Map controller for automatic navigation */}
                  <MapController center={mapCenter} zoom={mapZoom} />
                  
                  {/* Map click handler */}
                  <MapClickHandler onMapClick={handleMapClick} />
                  
                  {/* Location marker */}
                  {currentWeather && currentWeather.latitude && currentWeather.longitude && (
                    <CircleMarker
                      center={[currentWeather.latitude, currentWeather.longitude]}
                      radius={15}
                      fillColor={getAQIColor(currentWeather.AQI)}
                      color="#ffffff"
                      weight={3}
                      fillOpacity={0.9}
                      stroke={true}
                    >
                      <LeafletTooltip permanent={true} direction="top" offset={[0, -20]}>
                        <div className="map-tooltip">
                          <strong>{currentWeather.city}</strong><br/>
                          🌡️ {currentWeather.temperature}°C<br/>
                          🌬️ AQI: {currentWeather.AQI} - {getAQILabel(currentWeather.AQI)}<br/>
                          💨 Wind: {currentWeather.wind_speed} km/h<br/>
                          💧 Humidity: {currentWeather.humidity}%
                        </div>
                      </LeafletTooltip>
                    </CircleMarker>
                  )}
                </MapContainer>
              </div>
              
              {/* Map legend */}
              <div className="mt-3">
                <small className="text-muted">
                  <strong>Air Quality Legend:</strong>
                  <span className="ms-2 me-3">
                    <span style={{backgroundColor: '#00e400', color: 'white', padding: '2px 6px', borderRadius: '3px', fontSize: '10px'}}>Good</span>
                  </span>
                  <span className="me-3">
                    <span style={{backgroundColor: '#ffff00', color: 'black', padding: '2px 6px', borderRadius: '3px', fontSize: '10px'}}>Moderate</span>
                  </span>
                  <span className="me-3">
                    <span style={{backgroundColor: '#ff7e00', color: 'white', padding: '2px 6px', borderRadius: '3px', fontSize: '10px'}}>Unhealthy for Sensitive</span>
                  </span>
                  <span className="me-3">
                    <span style={{backgroundColor: '#ff0000', color: 'white', padding: '2px 6px', borderRadius: '3px', fontSize: '10px'}}>Unhealthy</span>
                  </span>
                  <span className="me-3">
                    <span style={{backgroundColor: '#8f3f97', color: 'white', padding: '2px 6px', borderRadius: '3px', fontSize: '10px'}}>Very Unhealthy</span>
                  </span>
                  <span>
                    <span style={{backgroundColor: '#7e0023', color: 'white', padding: '2px 6px', borderRadius: '3px', fontSize: '10px'}}>Hazardous</span>
                  </span>
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Anomalies */}
        <div className="mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Detected Temperature Anomalies</h5>
              {anomalies.length === 0 ? (
                <p>No temperature anomalies detected in the last 30 days.</p>
              ) : (
                <ul className="list-group">
                  {anomalies.map((item, idx) => (
                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{item.date}</strong> - Temperature: {item.temperature}°C
                      </div>
                      <span className="badge bg-warning rounded-pill">
                        Deviation: {item.deviation?.toFixed(1)}°C
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
