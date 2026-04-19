// Mirrors backend/entities.py. Hand-written for v1; swap for OpenAPI codegen
// once the backend exposes real routes with stable schemas.

export type DietType = "veg" | "non_veg";

export type MealTime = "breakfast" | "lunch" | "dinner" | "snack";

export interface DatabaseRecord {
  is_deleted: boolean;
  last_updated: string; // ISO date
  created_on: string; // ISO date
}

export interface Flatmate extends DatabaseRecord {
  id: string;
  name: string;
  email: string;
  flat_id: string;
  diet_types: DietType[];
  like_recipes: string[];
  dislike_recipes: string[];
}

export interface FlatmateAvailability extends DatabaseRecord {
  flatmate_id: string;
  date: string;
  available: boolean;
}

export interface Recipe extends DatabaseRecord {
  id: string;
  meal_time: MealTime;
  diet_types: DietType[];
  photo: string;
  url: string;
}

export interface Cook extends DatabaseRecord {
  id: string;
  name: string;
}

export interface Flat extends DatabaseRecord {
  id: string;
  address: string;
  cook_id: string;
  recipes: string[];
}

export interface FlatAction extends DatabaseRecord {
  flat_id: string;
  date: string;
  meal_time: MealTime;
  is_meal_made: boolean;
  meal_id: string | null;
}

export interface HealthResponse {
  status: string;
}
