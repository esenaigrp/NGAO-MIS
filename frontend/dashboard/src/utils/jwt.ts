// src/utils/jwt.ts
export const decodeJwt = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch (err) {
    console.error("Invalid JWT", err);
    return null;
  }
};
