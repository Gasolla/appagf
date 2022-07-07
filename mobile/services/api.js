import axios from 'axios';
import { AsyncStorage } from 'react-native';
axios.defaults.timeout = 10000;
const { token } = axios.CancelToken.source();
setTimeout(() => {token.cancel;}, 10000);
const api = axios.create({
  //baseURL: 'http://192.168.1.30:3333/',   // ambiente desenvolvimento
  //baseURL: 'http://192.168.1.250:3333/', // ambiente desenvolvimento
  //baseURL: 'http://mrs-sp.ddns.net:3232/', // ambiente desenvolvimento
  baseURL: 'http://mrs-sp.ddns.net:3333/', // ambiente de producao
  timeout: 10000, 
  cancelToken: token
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('@MRSApp:token');
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
      config.timeout = 10000; 
    }
    return config;
  } catch (err) {
    alert(err);
  }
});

export default api;