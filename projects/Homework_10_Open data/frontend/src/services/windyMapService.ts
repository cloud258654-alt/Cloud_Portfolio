export interface CityConfig {
    name: string;
    lat: number;
    lon: number;
}

export const SUPPORTED_CITIES: Record<string, CityConfig> = {
    taipei: { name: "Taipei", lat: 25.0330, lon: 121.5654 },
    taichung: { name: "Taichung", lat: 24.1477, lon: 120.6736 },
    tainan: { name: "Tainan", lat: 22.9997, lon: 120.2270 },
    kaohsiung: { name: "Kaohsiung", lat: 22.6273, lon: 120.3014 },
    hualien: { name: "Hualien", lat: 23.9772, lon: 121.6044 },
    taitung: { name: "Taitung", lat: 22.7583, lon: 121.1444 }
};

export interface LayerConfig {
    key: string;
    label: string;
}

export const SUPPORTED_LAYERS: LayerConfig[] = [
    { key: "temp", label: "Temperature" },
    { key: "wind", label: "Wind" },
    { key: "rain", label: "Rain" },
    { key: "pressure", label: "Pressure" },
    { key: "clouds", label: "Clouds" }
];
