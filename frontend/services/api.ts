import axios from "axios";

const API = axios.create({
  // For Android Emulator: use 10.0.2.2 instead of localhost/127.0.0.1
  // For physical device: use your PC's actual WiFi IP (e.g. 192.168.1.x)
  // For Android Studio emulator on Windows: 10.0.2.2 or your WiFi IP
  baseURL: "http://172.28.19.108:5000/api",
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;