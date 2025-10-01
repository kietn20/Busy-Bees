import api from "./config";

// for delete account button
export const deleteAccount = async (token) => {
  try {
    await api.delete("/account", { 
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch (error) {
    throw new Error("Delete account failed. Please try again.");
  }
};