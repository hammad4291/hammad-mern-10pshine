import axios from 'axios';

const BaseURL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:44392/';

const API = axios.create({
    baseURL: `${BaseURL.endsWith('/') ? BaseURL : BaseURL + '/'}api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 1. Automatically add the Access Token to protected API requests
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// =========================================================================
// 2. ADD THIS: Catch 401 Expiration Errors & Handle the Token Refresh Call
// =========================================================================
API.interceptors.response.use(
    (response) => {
        // If the request succeeds, just pass the data right back to your page
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If backend returns 401 (Unauthorized) and we haven't already retried this request
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Prevents infinite loops if the refresh fails

            try {
                const accessToken = localStorage.getItem('accessToken');
                const refreshToken = localStorage.getItem('refreshToken');

                // SILENT HANDSHAKE: Call the background /auth/refresh API directly using raw axios
                const response = await axios.post(`${API.defaults.baseURL}/auth/refresh`, {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                });

                if (response.status === 200) {
                    const { accessToken: newAccess, refreshToken: newRefresh } = response.data;

                    // Update storage with the brand new keys
                    localStorage.setItem('accessToken', newAccess);
                    localStorage.setItem('refreshToken', newRefresh);

                    // Re-attach the fresh access token to our original failed request
                    originalRequest.headers.Authorization = `Bearer ${newAccess}`;

                    // Re-execute and return the original request seamlessly!
                    return API(originalRequest);
                }
            } catch (refreshError) {
                // If the refresh token is also invalid or expired, session is dead. Kick to login.
                console.error("Refresh token cycle failed. Wiping session details.");
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default API;