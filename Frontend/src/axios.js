import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
});

export default axiosClient;