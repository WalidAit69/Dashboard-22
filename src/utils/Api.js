import axios from 'axios';

const API = axios.create({
    baseURL: 'http://196.206.227.23/api',
});

export default API;
