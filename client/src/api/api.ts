import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { clearUser, setAuth } from "../redux/slices/authSlice";
import { store } from "../redux/store";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true,
});

// Utility to get cookies by name
const getCookies = (tokenName: string): string | null => {
  const token = document.cookie
    .split("; ")
    .find((r) => r.startsWith(`${tokenName}=`));

  return token ? token.split("=")[1] : null;
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const accessToken = getCookies("accessToken");
    // console.log("Cookies ", document.cookie);

    // console.log(accessToken);

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    // console.log("config", config);
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      store.dispatch(clearUser());
      store.dispatch(setAuth(false));
      return Promise.reject(new Error("Session expired. Please log in again."));
    }

    return Promise.reject(error);
  }
);

export { api };
