// src/auth/tokenStorage.ts
const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export const setAccessToken = (token: string) => {
  localStorage.setItem(ACCESS_KEY, token);
};

export const setRefreshToken = (token: string) => {
  localStorage.setItem(REFRESH_KEY, token);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_KEY);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};
