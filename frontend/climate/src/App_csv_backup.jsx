import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

// Recharts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar
} from "recharts";

// Leaflet
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function App() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState("");
  const [anomalies, setAnomalies] = useState([]);

  // Fetch climate data and summary
  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/data")
      .then(res => setData(res.data))
      .catch(err => console.error(err));

    axios.get("http://127.0.0.1:5000/api/summary")
      .then(res => setSummary(res.data.summary))
      .catch(err => console.error(err));

    axios.get("http://127.0.0.1:5000/api/anomalies")
      .then(res => setAnomalies(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark mb-4">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">🌍 Climate Data Visual Explorer</span>
        </div>
      </nav>

      <div className="px-3">
        {/* Summary */}
        <div className="alert alert-info">
          <h5>Summary</h5>
          <p>{summary || "Loading summary..."}</p>
        </div>

        {/* Charts Section */}
        <div className="row">
          <div className="col-md-6 mb-4">
            <h5>Temperature Trend</h5>
            <LineChart width={500} height={300} data={data}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="temperature" stroke="#ff7300" />
            </LineChart>
          </div>

          <div className="col-md-6 mb-4">
            <h5>Rainfall</h5>
            <BarChart width={500} height={300} data={data}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rainfall" fill="#82ca9d" />
            </BarChart>
          </div>
        </div>

        {/* AQI Chart */}
        <div className="mb-4">
          <h5>Air Quality Index (AQI)</h5>
          <LineChart width={1000} height={300} data={data}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="AQI" stroke="#00aaff" />
          </LineChart>
        </div>

        {/* Heatmap */}
        <div className="mb-4">
          <h5>Geographical Heatmap (AQI by Location)</h5>
          <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "400px", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {data.map((city, index) => (
              <CircleMarker
                key={index}
                center={[city.latitude || 20, city.longitude || 78]} // fallback location
                radius={Math.min(city.AQI / 10, 20)}
                fillColor="red"
                color="red"
                fillOpacity={0.5}
              >
                <LeafletTooltip>
                  {city.city}: AQI {city.AQI}
                </LeafletTooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Anomalies */}
        <div className="mb-4">
          <h5>Detected Temperature Anomalies</h5>
          {anomalies.length === 0 ? (
            <p>No anomalies detected.</p>
          ) : (
            <ul className="list-group">
              {anomalies.map((item, idx) => (
                <li key={idx} className="list-group-item">
                  {item.date} - Temperature: {item.temperature}°C
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
