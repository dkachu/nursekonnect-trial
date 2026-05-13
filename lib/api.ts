import axios from 'axios';

interface FailedRequest {
  resolve: () => void;
  reject: (error: unknown) => void;
}

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/', 
    withCredentials: true, // Crucial: Transmits and accepts HttpOnly cookies
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    // NATIVE FIX: Automates reading and sending Django CSRF cookies 
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
});

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve();
    });
    failedQueue = [];
};

// Keeping your manual request interceptor as a fallback mechanism for SSR contexts
api.interceptors.request.use((config) => {
    if (typeof document !== "undefined" && !config.headers['X-CSRFToken']) {
        const value = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        
        if (value) {
            config.headers['X-CSRFToken'] = value;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Block interceptor loops on auth routes
        if (
            originalRequest.url?.includes("accounts/token/refresh/") || 
            originalRequest.url?.includes("accounts/login/")
        ) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise<void>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then(() => {
                    // Added a 50ms delay to let the browser register the new cookie
                    return new Promise(res => setTimeout(res, 50));
                })
                .then(() => api(originalRequest))
                .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Hits your CookieTokenRefreshView
                await api.post("accounts/token/refresh/");
                
                isRefreshing = false;
                processQueue(null);
                
                // Allow a tiny window for the browser to register the updated HttpOnly cookie
                await new Promise(res => setTimeout(res, 50));
                return api(originalRequest);
                
            } catch (refreshError: unknown) {
                isRefreshing = false;
                processQueue(refreshError);
                
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
