"use client";

import { api, ApiError } from "./api";

export type BeCook = {
  id: string;
  name: string;
};

export type BeFlat = {
  id: string;
  address: string;
  cook_id: string;
  recipes: string[];
};

export type BeFlatmate = {
  id: string;
  name: string;
  email: string;
  flat_id: string;
  diet_types: Array<"veg" | "non_veg">;
  like_recipes: string[];
  dislike_recipes: string[];
};

export type BeRecipe = {
  id: string;
  name: string;
  meal_time: "breakfast" | "lunch" | "dinner" | "snack";
  diet_types: Array<"veg" | "non_veg">;
  photo: string;
  url: string;
};

export type BeSeedResult = { cooks: number; flats: number; flatmates: number };

export const backend = {
  health: () => api<{ status: string }>("/health"),
  seed: () => api<BeSeedResult>("/seed", { method: "POST" }),
  listCooks: () => api<BeCook[]>("/cooks"),
  listFlats: () => api<BeFlat[]>("/flats"),
  listFlatmates: () => api<BeFlatmate[]>("/flatmates"),
  listRecipes: () => api<BeRecipe[]>("/recipes"),
  patchFlatmate: (
    id: string,
    patch: Partial<Pick<BeFlatmate, "name" | "email" | "flat_id" | "diet_types" | "like_recipes" | "dislike_recipes">>,
  ) =>
    api<BeFlatmate>(`/flatmates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
};

export { ApiError };
