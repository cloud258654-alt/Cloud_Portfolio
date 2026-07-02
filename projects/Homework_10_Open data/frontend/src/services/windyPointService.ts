export interface ForecastData {
    temp: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    pressure: number;
    rain: number; // in mm
    cloud: number; // in %
    time: string;
    model: string;
}

export async function fetchPointForecast(lat: number, lon: number): Promise<ForecastData[]> {
    const res = await fetch("http://127.0.0.1:5000/api/windy-forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon })
    });
    
    if (!res.ok) {
        throw new Error(`Windy Point Forecast proxy returned HTTP ${res.status}`);
    }
    
    const data = await res.json();
    
    const tempArr = data["temp-surface"];
    const windUArr = data["wind_u-surface"];
    const windVArr = data["wind_v-surface"];
    const rhArr = data["rh-surface"];
    const pressureArr = data["pressure-surface"];
    const rainArr = data["past3hprecip-surface"];
    const cloudArr = data["lclouds-surface"];
    
    if (!tempArr || !windUArr || !windVArr || !rhArr || !pressureArr) {
        throw new Error("Missing parameter arrays in Windy Point Forecast API response");
    }
    
    const indices = [0, 1, 2, 4, 8];
    const times = ["Now", "+3h", "+6h", "+12h", "+24h"];
    
    return indices.map((idx, timeIdx) => {
        const tempK = tempArr[idx] !== undefined ? tempArr[idx] : 298.15;
        const u = windUArr[idx] !== undefined ? windUArr[idx] : 0;
        const v = windVArr[idx] !== undefined ? windVArr[idx] : 0;
        const rh = rhArr[idx] !== undefined ? rhArr[idx] : 80;
        const pressurePa = pressureArr[idx] !== undefined ? pressureArr[idx] : 101300;
        const rainM = rainArr && rainArr[idx] !== undefined ? rainArr[idx] : 0;
        const cloudPct = cloudArr && cloudArr[idx] !== undefined ? cloudArr[idx] : 0;
        
        const tempC = parseFloat((tempK - 273.15).toFixed(1));
        const windSpeed = parseFloat(Math.sqrt(u * u + v * v).toFixed(1));
        let windDir = Math.round((270 - Math.atan2(v, u) * 180 / Math.PI) % 360);
        if (windDir < 0) windDir += 360;
        const pressureHpa = parseFloat((pressurePa / 100).toFixed(1));
        const rainMm = parseFloat((rainM * 1000).toFixed(2)); // convert m to mm
        const cloudVal = Math.round(cloudPct);
        
        return {
            temp: tempC,
            humidity: Math.round(rh),
            windSpeed: windSpeed,
            windDirection: windDir,
            pressure: pressureHpa,
            rain: rainMm,
            cloud: cloudVal,
            time: times[timeIdx],
            model: "GFS (27km) via Windy API"
        };
    });
}

export function generateMockForecast(lat: number, lon: number): ForecastData[] {
    const baseTemp = 32.0 - (lat - 22.0) * 0.8 - Math.random() * 2.0;
    const baseWind = 3.0 + (122.0 - lon) * 4.0 + Math.random() * 3.0;
    const baseHumidity = 70 + Math.floor(Math.random() * 15);
    const basePressure = 1012.0 - (lat - 22.0) * 0.5;

    const times = ["Now", "+3h", "+6h", "+12h", "+24h"];
    
    return times.map((t, idx) => {
        const tempOffset = idx === 1 ? 0.5 : idx === 2 ? -1.5 : idx === 3 ? -4.0 : 1.0;
        const windOffset = Math.sin(idx) * 1.5;
        const humidOffset = idx === 3 ? 10 : -5;
        
        return {
            temp: parseFloat((baseTemp + tempOffset).toFixed(1)),
            humidity: Math.min(100, Math.max(0, baseHumidity + humidOffset)),
            windSpeed: parseFloat(Math.max(0.5, baseWind + windOffset).toFixed(1)),
            windDirection: Math.floor((180 + lat * 10 + idx * 45) % 360),
            pressure: parseFloat((basePressure + Math.sin(idx) * 1.2).toFixed(1)),
            rain: idx === 2 || idx === 3 ? parseFloat((Math.random() * 5).toFixed(1)) : 0,
            cloud: Math.min(100, Math.max(0, 30 + idx * 15 + Math.floor(Math.random() * 20))),
            time: t,
            model: "ECMWF (9km) Simulation"
        };
    });
}
