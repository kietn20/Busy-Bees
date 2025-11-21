import api from "./config";

export type RecentlyViewedKind = "note" | "flashcardSet";

export interface AddRecentlyViewedParams {
  courseId: string;
  kind: RecentlyViewedKind;
  itemId: string;
}

export interface RemoveRecentlyViewedParams {
  courseId: string;
  kind: RecentlyViewedKind;
  itemId: string;
}

export interface GetRecentlyViewedParams {
  courseId: string;
  kind?: RecentlyViewedKind;
}

export interface CheckRecentlyViewedParams {
  courseId: string;
  kind: RecentlyViewedKind;
  itemIds: string[];
}

// Add a recently viewed item
export function addRecentlyViewed(params: AddRecentlyViewedParams) {
  return api.post("/account/recently-viewed", params);
}

// Remove a recently viewed item
export function removeRecentlyViewed(params: RemoveRecentlyViewedParams) {
  return api.delete("/account/recently-viewed", { data: params });
}

// Get recently viewed items for a course (optionally filter by kind)
export function getRecentlyViewed(params: GetRecentlyViewedParams) {
  return api.get("/account/recently-viewed", { params });
}

// Bulk check recently viewed
export function checkRecentlyViewed(params: CheckRecentlyViewedParams) {
  return api.post("/account/recently-viewed/check", params);
}