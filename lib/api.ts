import axios, { InternalAxiosRequestConfig } from 'axios';

interface FailedRequest {
  resolve: () => void;
  reject: (error: unknown) => void;
}

const isProd = process.env.NODE_ENV === 'production';

// Safely format endpoint paths for both local containers and cloud deployment hosts
const getBaseUrl = (): string => {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (rawUrl) {
        const cleanUrl = rawUrl.endsWith('/') ? rawUrl : `${rawUrl}/`;
        return cleanUrl.includes('/api/') ? cleanUrl : `${cleanUrl}api/`;
    }
    
    // Fixed: Aligned production fallback variables to your explicit cloud core network subdomains precisely
    return isProd
        ? 'https://onrender.com'
        : 'http://localhost:10000/api/';
};

const api = axios.create({
    baseURL: getBaseUrl(), 
    withCredentials: true, 
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

// Inject current Django cross-site request tokens to outbound headers
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

// Intercept expired authentication errors to handle session updates automatically
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest || originalRequest._retry) {
            return Promise.reject(error);
        }

        const urlPath = originalRequest.url || '';
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
