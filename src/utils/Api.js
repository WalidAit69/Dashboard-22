import axios from 'axios';

const API = axios.create({
    baseURL: 'https://localhost:44303/api'/*'http://196.206.227.23/api',*/
});

export default API;
