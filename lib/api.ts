import axios, { InternalAxiosRequestConfig } from 'axios';

interface FailedRequest {
  resolve: () => void;
  reject: (error: unknown) => void;
}

const isProd = process.env.NODE_ENV === 'production';

// Synchronizes the base URL mapping structure safely to handle both local and cloud environments
const getBaseUrl = (): string => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    return isProd
        ? `https://${process.env.NEXT_PUBLIC_API_DOMAIN || 'nursekonnect-back.onrender.com'}/api/`
        : 'http://localhost:10000/api/';
};

const api = axios.create({
    baseURL: getBaseUrl(), 
    withCredentials: true, // Crucial for passing SimpleJWT access_token HTTP cookies to Render safely
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
});

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

// Intercepts outbound frames to inject native Django CSRF tokens from browser cookie states
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (typeof document !== "undefined" && !config.headers['X-CSRFToken']) {
        const value = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        
        if (value) {
            config.headers['X-CSRFToken'] = decodeURIComponent(value);
        }
    }
    return config;
});

// Asynchronous interceptor loop to catch 401 Session Drops and auto-refresh credentials
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest || originalRequest._retry) {
            return Promise.reject(error);
        }

        const urlPath = originalRequest.url || '';
        // Skip fallback execution logic loops for core gateway auth routes
        if (urlPath.includes("accounts/token/refresh/") || urlPath.includes("accounts/login/")) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401) {
            if (isRefreshing) {
                return new Promise<void>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then(() => api(originalRequest))
                .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Hits your custom CookieTokenRefreshView inside accounts/views.py over safe cross-origin cookies
                await api.post("accounts/token/refresh/");
                
                const currentQueue = [...failedQueue];
                failedQueue = [];
                isRefreshing = false;
                
                currentQueue.forEach(prom => prom.resolve());
                
                return api(originalRequest);
                
            } catch (refreshError: unknown) {
                const currentQueue = [...failedQueue];
                failedQueue = [];
                isRefreshing = false;
                
                currentQueue.forEach(prom => prom.reject(refreshError));
                
                // Evict the client and route cleanly to login state routes if the session refresh falls flat
                if (typeof window !== "undefined") {
                    const publicRoutes = ["/login", "/register", "/"];
                    if (!publicRoutes.includes(window.location.pathname)) {
                        window.location.href = "/login?session=expired";
                    }
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
