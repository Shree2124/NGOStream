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

const getCookies = (tokenName: string): string | null => {
  const token = document.cookie
    .split("; ")
    .find((r) => r.startsWith(`${tokenName}=`));

  return token ? token.split("=")[1] : null;
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const accessToken = getCookies("accessToken");
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

let isRefreshing = false;
let refreshSubscribers: ((newAccessToken: string) => void)[] = [];

function onRefreshed(newAccessToken: string): void {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (newAccessToke: string) => void): void {
  refreshSubscribers.push(callback);
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        const refreshToken = getCookies("refreshToken");

        if (!refreshToken) {
          store.dispatch(clearUser());
          store.dispatch(setAuth(false));
          return Promise.reject(new Error("Refresh token is missing."));
        }

        try {
          const refreshResponse = await api.post<{ accessToken: string }>(
            "/users/refresh-token",
            { refreshToken }
          );
          const newAccessToken = refreshResponse?.data?.accessToken;

          if (newAccessToken) {
            document.cookie = `accessToken=${newAccessToken}; path=/; secure; SameSite=None`;
            api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
            onRefreshed(newAccessToken);
          }
        } catch (refreshError) {
          store.dispatch(clearUser());
          store.dispatch(setAuth(false));
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve) => {
        addRefreshSubscriber((newAccessToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

export { api };
