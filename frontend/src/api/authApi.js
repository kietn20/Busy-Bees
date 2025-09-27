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
    await api.post("/auth/logout/", {});
  } catch (error) {
    throw new Error("Logout failed. Please try again.");
  }
};

export const signup = async ({ firstname, lastname, email, password }) => {
  try {
    const response = await api.post("/auth/register", {
      firstname,
      lastname,
      email,
      password,
    });

    const { token, user } = response.data;

    return { token, user };
  } catch (error) {
    throw new Error("Signup failed. Please try again.");
  }
};
