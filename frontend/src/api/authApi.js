import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const login = async ({ email, password }) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/login/`,
      { email, password },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    if (error?.response?.data) throw error.response.data;
  }
};
export const logout = async () => {
  try {
    await axios.post(`${API_URL}/auth/logout/`, {}, { withCredentials: true });
  } catch (error) {
    if (error?.response?.data) throw error.response.data;
  }
};

export const signup = async ({ firstname, lastname, email, password }) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/register/`,
      { firstname, lastname, email, password },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    if (error?.response?.data) throw error.response.data;
  }
};
