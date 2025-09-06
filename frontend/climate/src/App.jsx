import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import LocationSearch from "./components/LocationSearch";

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
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function App() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState("");
  const [anomalies, setAnomalies] = useState([]);
  const [selectedCity, setSelectedCity] = useState("London");
  const [loading, setLoading] = useState(false);
  const [currentWeather, setCurrentWeather] = useState(null);

  // Fetch data for selected city
  const fetchDataForCity = async (city) => {
    setLoading(true);
    try {
      // Fetch historical data
      const dataRes = await axios.get(`http://127.0.0.1:5000/api/data?city=${city}&days=14`);
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

  // Fetch data when city changes
  useEffect(() => {
    if (selectedCity) {
      fetchDataForCity(selectedCity);
    }
  }, [selectedCity]);

  const handleLocationSelect = (cityName) => {
    setSelectedCity(cityName);
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

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark mb-4">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">🌍 Climate Data Visual Explorer</span>
          <div className="d-flex align-items-center">
            <LocationSearch 
              onLocationSelect={handleLocationSelect}
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
                        className="badge fs-6" 
                        style={{backgroundColor: getAQIColor(currentWeather.AQI)}}
                      >
                        AQI: {currentWeather.AQI} - {getAQILabel(currentWeather.AQI)}
                      </span>
                    </div>
                    <div className="col-md-3">
                      <p className="mb-1">Wind: {currentWeather.wind_speed} km/h</p>
                      <p className="mb-1">Pressure: {currentWeather.pressure} mb</p>
                      <p className="mb-1">UV Index: {currentWeather.uv_index}</p>
                    </div>
                    <div className="col-md-3">
                      <p className="mb-1">PM2.5: {currentWeather['PM2.5']} μg/m³</p>
                      <p className="mb-1">PM10: {currentWeather.PM10} μg/m³</p>
                      <p className="mb-1">NO2: {currentWeather.NO2} μg/m³</p>
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

        {/* Charts Section */}
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Temperature Trend (Last 14 Days)</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
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
                <h5 className="card-title">Rainfall (Last 14 Days)</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rainfall" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* AQI Chart */}
        <div className="mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Air Quality Index (AQI) Trend</h5>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="AQI" stroke="#00aaff" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Air Quality Details */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">PM2.5 Levels</h5>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="PM2.5" stroke="#e74c3c" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">PM10 Levels</h5>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="PM10" stroke="#9b59b6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap */}
        {data.length > 0 && data[0].latitude && (
          <div className="mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Geographical Location</h5>
                <MapContainer center={[data[0].latitude, data[0].longitude]} zoom={10} style={{ height: "400px", width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <CircleMarker
                    center={[data[0].latitude, data[0].longitude]}
                    radius={20}
                    fillColor={getAQIColor(currentWeather?.AQI || 0)}
                    color={getAQIColor(currentWeather?.AQI || 0)}
                    fillOpacity={0.7}
                  >
                    <LeafletTooltip>
                      <div>
                        <strong>{selectedCity}</strong><br/>
                        Temperature: {currentWeather?.temperature}°C<br/>
                        AQI: {currentWeather?.AQI} - {getAQILabel(currentWeather?.AQI || 0)}
                      </div>
                    </LeafletTooltip>
                  </CircleMarker>
                </MapContainer>
              </div>
            </div>
          </div>
        )}

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
