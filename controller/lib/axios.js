const axios = require("axios");
const MY_TOKEN = process.env.TELEGRAM_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${MY_TOKEN}`;
function getAxiosInstance() {
    return {
        get(method, params) {
            return axios.get(`/${method}`, {
                baseURL: BASE_URL,
                params,
            });
        },
        post(method, params) {
            return axios.post(`/${method}`, params, {
                baseURL: BASE_URL,
            });
        },
    };
}
module.exports = { axiosInstance: getAxiosInstance() };