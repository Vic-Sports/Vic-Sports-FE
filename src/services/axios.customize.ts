import axios from "axios";
import { Mutex } from "async-mutex";

const mutex = new Mutex();

const createInstanceAxios = (baseURL: string) => {
  const instance = axios.create({
    // baseURL: import.meta.env.VITE_BACKEND_URL,
    baseURL: baseURL,
    withCredentials: true // có thuộc tính này sẽ su dung đc cookies (refresh token)
  });

  const handleRefreshToken = async () => {
    return await mutex.runExclusive(async () => {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) return null;

      const res = await instance.post("/api/v1/auth/refresh-token", {
        refreshToken
      });
      const newToken = res?.data?.token;
      const newRefreshToken = res?.data?.refreshToken;
      if (newToken) {
        localStorage.setItem("access_token", newToken);
        if (newRefreshToken) {
          localStorage.setItem("refresh_token", newRefreshToken);
        }
        return newToken;
      }
      return null;
    });
  };

  // Add a request interceptor
  instance.interceptors.request.use(
    function (config) {
      // Do something before request is sent
      const token = localStorage.getItem("access_token");
      const auth = token ? `Bearer ${token}` : "";
      config.headers["Authorization"] = auth;

      return config;
    },
    function (error) {
      // Do something with request error
      return Promise.reject(error);
    }
  );

  // Add a response interceptor
  instance.interceptors.response.use(
    function (response) {
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with response data
      if (response && response.data) {
        return response.data;
      }
      return response;
    },
    async function (error) {
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      // Do something with response error
      if (error.config && error.response && +error.response.status === 401) {
        const newToken = await handleRefreshToken();
        if (newToken) {
          error.config.headers["Authorization"] = `Bearer ${newToken}`;
          return instance.request(error.config);
        }
      }

      if (error && error.response && error.response.data) {
        return error.response.data;
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export default createInstanceAxios;
