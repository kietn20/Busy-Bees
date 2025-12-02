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
      // Instead of throwing, return a rejected Promise that callers can catch
      return Promise.reject(err);
    }

    // Generic fallback error
    return Promise.reject(
      new Error("Delete account failed. Please try again.")
    );
  }
};

// Favorites API
export const addFavorite = async (courseId: string, kind: "note" | "flashcardSet", itemId: string) => {
  const payload = { courseId, kind, itemId };
  try {
    console.debug("addFavorite payload:", payload);
    const response = await api.post(`/account/favorites`, payload);
    return response.data;
  } catch (e: any) {
    console.error("addFavorite error:", e?.response ?? e);
    const msg = e?.response?.data?.message || e?.message || "Failed to add favorite";
    const err: any = new Error(msg);
    err.status = e?.response?.status;
    throw err;
  }
};

export const removeFavorite = async (courseId: string, kind: "note" | "flashcardSet", itemId: string) => {
  const payload = { courseId, kind, itemId };
  try {
    console.debug("removeFavorite payload:", payload);
    const response = await api.delete(`/account/favorites`, { data: payload });
    return response.data;
  } catch (e: any) {
    console.error("removeFavorite error:", e?.response ?? e);
    const msg = e?.response?.data?.message || e?.message || "Failed to remove favorite";
    const err: any = new Error(msg);
    err.status = e?.response?.status;
    throw err;
  }
};

// Bulk-check favorites for a list of itemIds. Returns an object mapping itemId->boolean
export const checkFavorites = async (
  courseId: string,
  kind: "note" | "flashcardSet",
  itemIds: string[]
) => {
  const payload = { courseId, kind, itemIds };
  try {
    console.debug("checkFavorites payload:", payload);
    const response = await api.post(`/account/favorites/check`, payload);
    // Debug: log the raw response body so we can inspect shape in the browser
    console.debug("checkFavorites response:", response.data);
    // Backend returns { results: { itemId: boolean } }
    const results = response.data?.results || {};
    const map: Record<string, boolean> = {};
    itemIds.forEach((id) => {
      map[id] = Boolean(results[id]);
    });
    return map;
  } catch (e: any) {
    console.error("checkFavorites error:", e?.response ?? e);
    const msg = e?.response?.data?.message || e?.message || "Failed to check favorites";
    const err: any = new Error(msg);
    err.status = e?.response?.status;
    throw err;
  }
};

// Get all favorites for a course (optionally filtered by kind)
export const getFavorites = async (courseId: string, kind?: "note" | "flashcardSet") => {
  try {
    console.debug("getFavorites params:", { courseId, kind });
    const response = await api.get(`/account/favorites`, { params: { courseId, kind } });
    console.debug("getFavorites response:", response.data);
    return response.data?.favorites || [];
  } catch (e: any) {
    console.error("getFavorites error:", e?.response ?? e);
    const msg = e?.response?.data?.message || e?.message || "Failed to get favorites";
    const err: any = new Error(msg);
    err.status = e?.response?.status;
    throw err;
  }
};