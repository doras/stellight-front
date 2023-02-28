import axios from 'axios';

export const $axios = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL // Set your API endpoint here
});

export default {
  install: (app) => {
    app.config.globalProperties.$axios = $axios;
  }
};
