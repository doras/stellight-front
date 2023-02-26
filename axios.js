import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000' // Set your API endpoint here
});

export default {
  install: (app) => {
    app.config.globalProperties.$axios = axiosInstance;
  }
};
