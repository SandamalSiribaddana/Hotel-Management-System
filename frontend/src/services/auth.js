import { apiRequest } from "./api";

export async function register({ name, email, password, role }) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: { name, email, password, role },
  });
}

export async function login({ email, password }) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function fetchProfile(token) {
  return apiRequest("/api/auth/profile", { token });
}

