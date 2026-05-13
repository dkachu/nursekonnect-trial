import axios from 'axios';

interface FailedRequest {
  resolve: () => void;
  reject: (error: unknown) => void;
}

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/', 
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

const processQueue = (error: unknown) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve();
    });
    failedQueue = [];
};

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
                .then(() => new Promise(res => setTimeout(res, 50)))
                .then(() => api(originalRequest))
                .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await api.post("accounts/token/refresh/");
                isRefreshing = false;
                processQueue(null);
                
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
