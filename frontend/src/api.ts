import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true
});

export const interceptors = (navigate: any) => {

    api.interceptors.response.use(
        (response) => response, 
        async (err) => {
            //if 401, send user to login
            if (err.response && err.response.status === 403) {
                console.log('navigating to /login');
                navigate("/login");
            } else if (err.response.status === 401) {
                await api.post('/auth/refresh-token');
                const ogEndpoint = err.config.url;
                const ogData = JSON.parse(err.config.data);
                await api.post(
                    ogEndpoint,
                    ogData
                );
            }
            return Promise.reject(err);
        }
    );
}

export default api;