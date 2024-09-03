import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true
});


export const interceptors = (navigate: any) => {

    //if 401, send user to login
    api.interceptors.response.use(

        (response) => response, 
        (err) => {
            if (err.response && err.response.status === 401) {
                navigate("/login");
            }
            return Promise.reject(err);
        }
    );
}

export default api;