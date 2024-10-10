import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: 'https://letterss.net',
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
                //refresh token then re call the function that triggered the error
                try {
                    const res = await api.post('/auth/refresh-token');
                    console.log(res);
                    const ogRequest = err.config;
                    return await api.request(ogRequest);
    
                } catch(err){
                    console.error(err);
                    navigate("/login");
                }
                
            }
            return Promise.reject(err);
        }
    );
}

export default api;