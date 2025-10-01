import api from "./config";

export const login = async ({ email, password }) => {
  try {
    const response = await api.post("/auth/login", { email, password });

    const { token, user } = response.data;

    return { token, user };
  } catch (error) {
    throw new Error("Login failed. Please try again.");
  }
};
export const logout = async () => {
  try {
    const res = await api.post("/auth/logout/", {}, { withCredentials: true });
    return res.data;
  } catch (error) {
    throw new Error("Logout failed. Please try again.");
  }
};

export const signup = async ({ firstName, lastName, email, password }) => {
  try {
    const response = await api.post("/auth/register", {
      firstName,
      lastName,
      email,
      password,
    });

    const { token, user } = response.data;

    return { token, user };
  } catch (error) {
    throw new Error("Signup failed. Please try again.");
  }
};
