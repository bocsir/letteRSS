import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true
});

export const interceptors = (navigate: any) => {

    api.interceptors.response.use(

        (response) => response, 
        (err) => {
            //if 401, send user to login
            if (err.response && err.response.status === 403) {
                console.log('navigating to /login');
                navigate("/login");
            }
            return Promise.reject(err);
        }
    );
}

export default api;