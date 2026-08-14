import axios from "axios";

// Falls back to the local backend for development. For a deployed build,
// set EXPO_PUBLIC_API_BASE_URL (e.g. in Vercel's project environment
// variables) to the public backend URL, such as
// "https://land-info-backend.onrender.com/api".
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

// Matches the backend's optional APP_SHARED_SECRET check (server.ts). Only
// meaningful once the backend is deployed publicly — see that file's
// comment for why this is a soft deterrent, not real access control.
const appSharedSecret = process.env.EXPO_PUBLIC_APP_SHARED_SECRET;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: appSharedSecret ? { "X-App-Secret": appSharedSecret } : undefined,
});
