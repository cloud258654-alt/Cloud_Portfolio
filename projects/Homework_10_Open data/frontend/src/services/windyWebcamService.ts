export interface WebcamData {
    id: number;
    title: string;
    city: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
    previewUrl: string;
    windyUrl: string;
    distance: number; // in km
}

// Haversine distance calculator
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return parseFloat(d.toFixed(1));
}

export async function fetchWebcams(lat: number, lon: number, radiusKm: number = 50): Promise<WebcamData[]> {
    const res = await fetch("http://127.0.0.1:5000/api/windy-webcams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon, radius: radiusKm, limit: 3 })
    });
    
    if (!res.ok) {
        throw new Error(`Windy Webcams proxy returned HTTP ${res.status}`);
    }
    
    const data = await res.json();
    const webcamsList = data.webcams || [];
    
    return webcamsList.map((cam: any) => {
        const camLat = cam.location?.latitude || 0;
        const camLon = cam.location?.longitude || 0;
        const distance = getDistanceKm(lat, lon, camLat, camLon);
        
        return {
            id: cam.webcamId,
            title: cam.title || "Webcam",
            city: cam.location?.city || "",
            region: cam.location?.region || "",
            country: cam.location?.country || "",
            latitude: camLat,
            longitude: camLon,
            previewUrl: cam.images?.current?.preview || "",
            windyUrl: `https://www.windy.com/webcams/${cam.webcamId}`,
            distance: distance
        };
    });
}
