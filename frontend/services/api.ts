import axios from "axios";

const API = axios.create({
  
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:5000/api",
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;