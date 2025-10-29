import api from "./config";

export interface DeleteAccountError {
  message: string;
  ownedGroupsCount?: number;
}

// The deleteAccount function doesn't need the token passed in anymore,
// because our axios interceptor in config.ts handles it automatically.
export const deleteAccount = async (): Promise<void> => {
  try {
    await api.delete("/account");
  } catch (error: any ) {
    // Pass through the backend error response
    if (error.response?.data) {
      const errorData: DeleteAccountError = error.response.data;
      const err: any = new Error(errorData.message);
      err.ownedGroupsCount = errorData.ownedGroupsCount;
      throw err;
    }
    throw new Error("Delete account failed. Please try again.");
  }
};