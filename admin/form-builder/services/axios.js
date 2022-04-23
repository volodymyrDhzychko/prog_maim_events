import axios from 'axios';

axios.interceptors.response.use((responce) => responce.data), (error) => Promise.reject(error);

export default axios;