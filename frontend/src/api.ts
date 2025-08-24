// @ts-ignore
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from "axios";
import { ACCESS_TOKEN } from "./constants";

// VITE_API_URL
const baseURL: string = import.meta.env.VITE_API_URL as string;

const api: AxiosInstance = axios.create({
    baseURL: baseURL
});

// Add the interceptor to the api to always use JWT
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token: string | null = localStorage.getItem(ACCESS_TOKEN);

        if (token) {
            // config.headers.Authorization = `Bearer ${token}`;
            (config.headers as any).Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError): Promise<AxiosError> => {
        // The error from an Axios interceptor is typically an AxiosError
        return Promise.reject(error);
    }
);

export default api;