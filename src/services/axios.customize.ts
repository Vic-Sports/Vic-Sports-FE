import { Mutex } from "async-mutex";
import axios from "axios";

const mutex = new Mutex();

const createInstanceAxios = (baseURL: string) => {
  const instance = axios.create({
    // baseURL: import.meta.env.VITE_BACKEND_URL,
    baseURL: baseURL,
    withCredentials: true // có thuộc tính này sẽ su dung đc cookies (refresh token)
  });

  const handleRefreshToken = async () => {
    return await mutex.runExclusive(async () => {
      const refreshToken = localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token");
      if (!refreshToken) return null;

      const res = await instance.post("/api/v1/auth/refresh-token", {
        refreshToken
      });
      if (res && res.data) {
        // Lưu refresh token mới vào cả localStorage và sessionStorage
        localStorage.setItem("refresh_token", res.data.refreshToken);
        sessionStorage.setItem("refresh_token", res.data.refreshToken);
        return res.data.token;
      }
      else return null;
    });
  };

  // Add a request interceptor
  instance.interceptors.request.use(
    function (config) {
      // Do something before request is sent
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
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
        const access_token = await handleRefreshToken();
        if (access_token) {
          error.config.headers["Authorization"] = `Bearer ${access_token}`;
          localStorage.setItem("access_token", access_token);
          sessionStorage.setItem("access_token", access_token);
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
