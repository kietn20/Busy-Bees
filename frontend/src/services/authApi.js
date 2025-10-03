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
    const res = await api.post("/account/logout/", {}, { withCredentials: true });
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
    console.error('Signup API Error:', error.response?.data || error.message);
    
    // Provide more specific error messages
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      const validationErrors = error.response.data.errors.map(err => err.msg).join(', ');
      throw new Error(`Validation Error: ${validationErrors}`);
    } else if (error.response?.status === 400) {
      throw new Error("Invalid signup data. Please check your inputs.");
    } else if (error.response?.status === 409) {
      throw new Error("An account with this email already exists.");
    } else {
      throw new Error("Signup failed. Please try again.");
    }
  }
};
