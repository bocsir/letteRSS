import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: 'http://localhost:3000', //'https://letterss.net'
    withCredentials: true
});

export const interceptors = (navigate: any) => {
    let isRefreshing = false;

    api.interceptors.response.use(
        (response) => response,
        async (err) => {
            if (err.response.status === 403) { //forbidden (refresh token expired)
                if (!isRefreshing) {
                    isRefreshing = true;
                    try {
                        const res = await api.post('/auth/refresh-token');
                        console.log(res);
                        const ogRequest = err.config;
                        isRefreshing = false;
                        return await api.request(ogRequest);
                    } catch(err){
                        console.error(err);
                        isRefreshing = false;
                        navigate("/login");
                    }
                }
            } else if (err.response.status === 401) { //unauthorized, (access token expired)
                console.error(err);
                navigate("/login");
            }
            return Promise.reject(err);
        }
    );
}

export default api;