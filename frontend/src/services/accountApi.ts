import api from "./config";

// The deleteAccount function doesn't need the token passed in anymore,
// because our axios interceptor in config.ts handles it automatically.
export const deleteAccount = async (): Promise<void> => {
  try {
    await api.delete("/account");
  } catch (error) {
    throw new Error("Delete account failed. Please try again.");
  }
};