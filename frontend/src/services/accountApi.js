import api from "./config";

// for delete account button
export const deleteAccount = async () => {
  try {
    await api.delete("/account", { withCredentials: true });
  } catch (error) {
    throw new Error("Delete account failed. Please try again.");
  }
};