from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

DATA_FILE = "data/environment.csv"

@app.route("/api/data")
def get_data():
    df = pd.read_csv(DATA_FILE)
    
    # Calculate AQI from PM2.5 (simplified calculation)
    # AQI formula based on PM2.5 concentration
    def calculate_aqi(pm25):
        if pm25 <= 12.0:
            return ((50 - 0) / (12.0 - 0)) * (pm25 - 0) + 0
        elif pm25 <= 35.4:
            return ((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51
        elif pm25 <= 55.4:
            return ((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101
        elif pm25 <= 150.4:
            return ((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151
        elif pm25 <= 250.4:
            return ((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201
        else:
            return ((500 - 301) / (500.4 - 250.5)) * (pm25 - 250.5) + 301
    
    # Create synthetic rainfall data based on humidity
    df['rainfall'] = (df['Humidity'] / 100) * np.random.uniform(0, 10, len(df))
    
    # Calculate AQI from PM2.5
    df['AQI'] = df['PM2.5'].apply(calculate_aqi).round(0)
    
    # Normalize column names for frontend
    df_processed = df.rename(columns={
        'City': 'city',
        'Date': 'date', 
        'Temperature': 'temperature'
    })
    
    # Select only needed columns
    columns_needed = ['city', 'date', 'temperature', 'rainfall', 'AQI', 'PM2.5', 'PM10', 'Humidity']
    df_final = df_processed[columns_needed]
    
    return jsonify(df_final.to_dict(orient="records"))

@app.route("/api/summary")
def summary():
    df = pd.read_csv(DATA_FILE)
    
    # Calculate AQI from PM2.5
    def calculate_aqi(pm25):
        if pm25 <= 12.0:
            return ((50 - 0) / (12.0 - 0)) * (pm25 - 0) + 0
        elif pm25 <= 35.4:
            return ((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51
        elif pm25 <= 55.4:
            return ((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101
        elif pm25 <= 150.4:
            return ((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151
        elif pm25 <= 250.4:
            return ((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201
        else:
            return ((500 - 301) / (500.4 - 250.5)) * (pm25 - 250.5) + 301
    
    # Create synthetic rainfall data
    df['rainfall'] = (df['Humidity'] / 100) * np.random.uniform(0, 10, len(df))
    df['AQI'] = df['PM2.5'].apply(calculate_aqi).round(0)
    
    avg_temp = round(df['Temperature'].mean(), 2)
    avg_rain = round(df['rainfall'].mean(), 2)
    avg_aqi = round(df['AQI'].mean(), 2)
    
    summary_text = (
        f"Average temperature is {avg_temp}°C. "
        f"Average rainfall is {avg_rain}mm. "
        f"Average AQI is {avg_aqi}, indicating moderate air quality."
    )
    return jsonify({"summary": summary_text})

@app.route("/api/anomalies")
def anomalies():
    df = pd.read_csv(DATA_FILE)
    threshold = df['Temperature'].mean() + (2 * df['Temperature'].std())
    anomalies_df = df[df['Temperature'] > threshold]
    
    # Normalize column names
    anomalies_df = anomalies_df.rename(columns={
        'City': 'city',
        'Date': 'date',
        'Temperature': 'temperature'
    })
    
    return jsonify(anomalies_df[['city', 'date', 'temperature']].to_dict(orient='records'))

if __name__ == "__main__":
    app.run(debug=True)
