# Windy API Troubleshooting

## 401 Invalid API Key

Meaning:
The API key is wrong, expired, or used with the wrong Windy API product.

Fix:
Use the correct API key for:
- Map Forecast API (`VITE_WINDY_MAP_API_KEY`)
- Point Forecast API (`VITE_WINDY_POINT_API_KEY`)
- Webcams API (`VITE_WINDY_WEBCAMS_API_KEY`)

## 403 Unauthorized Domain

Meaning:
The API key is valid, but the current domain is not allowed.

Fix:
Go to Windy API console and add the current development domain to Allowed Domains.

Common development domains:
- `localhost`
- `localhost:5173`
- `127.0.0.1`
- `127.0.0.1:5173`

Check current domain in browser console:

```js
window.location.origin
```
