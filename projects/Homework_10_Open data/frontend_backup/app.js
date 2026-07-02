/**
 * app.js
 * ------
 * Core logic for the CWA Weather Visualization Dashboard.
 * Fetches data from the Python Backend API, manages Map rendering, Marker coloring, and Chart visualization.
 */

const API_BASE_URL = "http://127.0.0.1:5000/api";

// Initialize Leaflet Map centered on Taiwan
const map = L.map('map', {
    zoomControl: false // Disable standard zoom control to reposition it
}).setView([23.973875, 120.982024], 7.5);

// Add custom Zoom Control to top-right
L.control.zoom({ position: 'topright' }).addTo(map);

// Add CartoDB Dark Matter tile layer (Sleek dark map aesthetic)
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// Layer group to hold map markers (so we can clear them on auto-refresh)
const markersLayer = L.layerGroup().addTo(map);

// Keep references to charts to destroy/recreate them on reload
let tempChart = null;
let rainChart = null;

// Helpers to color coordinate marker based on temperature
function getTempColor(temp) {
    if (temp === null || temp === undefined) return '#6b7280'; // gray (missing)
    if (temp >= 30) return '#ef4444'; // red (hot)
    if (temp >= 25) return '#f59e0b'; // orange (warm)
    if (temp >= 20) return '#10b981'; // green (mild)
    return '#3b82f6'; // blue (cool)
}

// Generate premium custom popup HTML
function createPopupContent(station) {
    const tempVal = station.air_temperature !== null ? `${station.air_temperature.toFixed(1)} °C` : 'N/A';
    const rainVal = station.precipitation !== null ? `${station.precipitation.toFixed(1)} mm` : 'N/A';
    const windVal = station.wind_speed !== null ? `${station.wind_speed.toFixed(1)} m/s` : 'N/A';
    const humidVal = station.relative_humidity !== null ? `${station.relative_humidity.toFixed(0)} %` : 'N/A';
    const pressureVal = station.air_pressure !== null ? `${station.air_pressure.toFixed(1)} hPa` : 'N/A';
    const weatherDesc = station.weather !== null ? station.weather : 'N/A';
    const location = `${station.county_name || ''} ${station.town_name || ''}`.trim() || 'Unknown Location';
    
    return `
        <div class="weather-popup">
            <h3>${station.station_name}</h3>
            <div class="popup-sub">${location} (ID: ${station.station_id})</div>
            <div class="popup-grid">
                <div class="popup-item">
                    <span class="popup-label">Temperature</span>
                    <span class="popup-value" style="color: ${getTempColor(station.air_temperature)}">${tempVal}</span>
                </div>
                <div class="popup-item">
                    <span class="popup-label">Precipitation</span>
                    <span class="popup-value highlight">${rainVal}</span>
                </div>
                <div class="popup-item">
                    <span class="popup-label">Wind Speed</span>
                    <span class="popup-value">${windVal}</span>
                </div>
                <div class="popup-item">
                    <span class="popup-label">Humidity</span>
                    <span class="popup-value">${humidVal}</span>
                </div>
                <div class="popup-item">
                    <span class="popup-label">Air Pressure</span>
                    <span class="popup-value">${pressureVal}</span>
                </div>
                <div class="popup-item">
                    <span class="popup-label">Condition</span>
                    <span class="popup-value">${weatherDesc}</span>
                </div>
            </div>
        </div>
    `;
}

// Populate stats panels in the sidebar
function updateStatsPanel(stats) {
    const tCard = document.getElementById('stat-temp');
    const rCard = document.getElementById('stat-rain');
    const gCard = document.getElementById('stat-gust');
    
    if (stats.max_temperature) {
        tCard.querySelector('.stat-value').innerText = `${stats.max_temperature.air_temperature.toFixed(1)} °C`;
        tCard.querySelector('.stat-location').innerText = `${stats.max_temperature.station_name} (${stats.max_temperature.county_name})`;
    }
    
    if (stats.max_precipitation) {
        rCard.querySelector('.stat-value').innerText = `${stats.max_precipitation.precipitation.toFixed(1)} mm`;
        rCard.querySelector('.stat-location').innerText = `${stats.max_precipitation.station_name} (${stats.max_precipitation.county_name})`;
    } else {
        rCard.querySelector('.stat-value').innerText = `0.0 mm`;
        rCard.querySelector('.stat-location').innerText = `No recent rain`;
    }
    
    if (stats.max_gust && stats.max_gust.peak_gust_speed !== null) {
        gCard.querySelector('.stat-value').innerText = `${stats.max_gust.peak_gust_speed.toFixed(1)} m/s`;
        gCard.querySelector('.stat-location').innerText = `${stats.max_gust.station_name} (${stats.max_gust.county_name})`;
    } else {
        gCard.querySelector('.stat-value').innerText = `N/A`;
        gCard.querySelector('.stat-location').innerText = `No gust wind data`;
    }
}

// Draw charts in the sidebar
function drawCharts(data) {
    // 1. Chart Data: Top 10 hottest stations
    const hottestStations = [...data]
        .filter(s => s.air_temperature !== null)
        .sort((a, b) => b.air_temperature - a.air_temperature)
        .slice(0, 10);
        
    const tempLabels = hottestStations.map(s => s.station_name);
    const tempValues = hottestStations.map(s => s.air_temperature);
    
    // 2. Chart Data: Top 10 wettest stations
    const wettestStations = [...data]
        .filter(s => s.precipitation !== null && s.precipitation > 0)
        .sort((a, b) => b.precipitation - a.precipitation)
        .slice(0, 10);
        
    const rainLabels = wettestStations.map(s => s.station_name);
    const rainValues = wettestStations.map(s => s.precipitation);

    // Destroy existing instances to prevent redraw bugs
    if (tempChart) tempChart.destroy();
    if (rainChart) rainChart.destroy();

    // Chart.js global dark mode configuration overrides
    Chart.defaults.color = '#9ca3af';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';

    // Render Hottest Chart
    const ctxTemp = document.getElementById('tempChart').getContext('2d');
    tempChart = new Chart(ctxTemp, {
        type: 'bar',
        data: {
            labels: tempLabels,
            datasets: [{
                label: 'Temperature (°C)',
                data: tempValues,
                backgroundColor: 'rgba(56, 189, 248, 0.65)',
                borderColor: '#38bdf8',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });

    // Render Precipitation Chart
    const ctxRain = document.getElementById('rainChart').getContext('2d');
    if (rainValues.length > 0) {
        rainChart = new Chart(ctxRain, {
            type: 'bar',
            data: {
                labels: rainLabels,
                datasets: [{
                    label: 'Rainfall (mm)',
                    data: rainValues,
                    backgroundColor: 'rgba(16, 185, 129, 0.65)',
                    borderColor: '#10b981',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    } else {
        // Show empty message container if no rainfall
        const parent = document.getElementById('rainChart').parentElement;
        parent.innerHTML = '<div class="no-data-msg" style="text-align:center; padding-top:40px; color:#6b7280; font-size:12px;">No rainfall recorded currently</div>';
    }
}

// Fetch data from local Flask API and update dashboard
async function fetchAndRenderDashboard() {
    console.log("[*] Fetching weather data from backend API...");
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    
    try {
        // Fetch weather data
        const resWeather = await fetch(`${API_BASE_URL}/weather`);
        if (!resWeather.ok) throw new Error("Weather API failed");
        const weatherJson = await resWeather.json();
        const records = weatherJson.data;

        // Fetch summarized stats
        const resStats = await fetch(`${API_BASE_URL}/stats`);
        if (!resStats.ok) throw new Error("Stats API failed");
        const statsJson = await resStats.json();
        const stats = statsJson.stats;

        // Set status online
        statusDot.className = 'status-dot online';
        statusText.innerText = 'Connected to API';

        // 1. Draw Map Markers (Clear previous markers first to avoid duplicates)
        markersLayer.clearLayers();
        records.forEach(station => {
            const lat = station.latitude_wgs84;
            const lon = station.longitude_wgs84;
            
            if (lat !== null && lon !== null) {
                // Circle marker style overrides for premium clean dashboard aesthetic
                const marker = L.circleMarker([lat, lon], {
                    radius: 7,
                    fillColor: getTempColor(station.air_temperature),
                    color: '#0b0f19',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.85
                });
                
                // Add details popup
                marker.bindPopup(createPopupContent(station));
                marker.addTo(markersLayer);
            }
        });

        // 2. Update Stats Panel
        updateStatsPanel(stats);

        // 3. Draw Leaderboard Charts
        drawCharts(records);
        
    } catch (err) {
        console.error("[!] Ingestion or rendering error:", err);
        statusDot.className = 'status-dot offline';
        statusText.innerText = 'Offline - API Server stopped';
        
        // Show placeholder messages
        document.querySelectorAll('.stat-value').forEach(el => el.innerText = '--');
        document.querySelectorAll('.stat-location').forEach(el => el.innerText = 'Server offline');
    }
}

// Initial fetch on page load
fetchAndRenderDashboard();

// Automatically fetch new data every 10 seconds for real-time visualization
setInterval(fetchAndRenderDashboard, 10000);
