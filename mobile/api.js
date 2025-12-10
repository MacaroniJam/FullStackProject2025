import axios from 'axios';

// Use HTTP for local development and set a short timeout so requests fail fast
// If you need HTTPS with self-signed certs, configure the device/emulator to trust it.
const api = axios.create({
    baseURL: 'http://10.0.2.2:8000',
    timeout: 5000, // 5 seconds
});

export default api;