import axios, { AxiosRequestHeaders } from "axios";
import { toast } from "sonner";



const api = axios.create({
    baseURL: "http://localhost:8080/api/v1",
    headers: {
      "Content-Type": "application/json",
    },
  });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const status = error.response.status;
            const messageFromServer =
                error.response.data?.message ||
                error.response.data?.error ||
                error.response.statusText;

            if (status === 401) {
                toast.error("Unauthorized", {
                    description:
                        messageFromServer ||
                        "Your session has expired. Please login again.",
                });
                // useUserStore.getState().logout();
            } else if (status === 403) {
                toast.error("forbidden", {
                    description:
                        messageFromServer ||
                        "You don't have permission to view this resource.",
                });
            } else if (status >= 400 && status < 500) {
                toast.error("Request Error", {
                    description:
                        messageFromServer || "Something went wrong with your request.",
                });
            } else if (status > 500) {
                toast.error("Server Error", {
                    description:
                        messageFromServer || "Oops! Something went wrong on the server.",

                });
            }
        }

        return Promise.reject(error);
    }
);
export default api;