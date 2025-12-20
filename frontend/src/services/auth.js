import api from "./api";
import { store } from "../store";
import { loginSuccess } from "../store/slices/authSlice";

async function login(email, password) {
  try {
    const res = await api.post("/auth/login/", {
      email,
      password,
    });

    const { access, refresh, user } = res.data;

    // Save tokens in localStorage
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);

    // Update Redux (THIS is important!)
    store.dispatch(
      loginSuccess({
        accessToken: access,
        refreshToken: refresh,
        user: user || null,
      })
    );

    return { success: true };
  } catch (err) {
    return {
      success: false,
      message:
        err.response?.data?.detail ||
        "Login failed. Check your email/password.",
    };
  }
}

export default { login };
