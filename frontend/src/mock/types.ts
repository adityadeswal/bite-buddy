export type DietType = "veg" | "non_veg" | "egg";
export type SpiceTolerance = "mild" | "medium" | "spicy" | "extra_spicy";
export type MealTime = "breakfast" | "lunch" | "dinner";
export type PlanStatus = "not_generated" | "ready" | "published";
export type SuggestionStatus = "pending" | "accepted" | "declined";

export interface Cook {
  id: string;
  name: string;
  photo: string;
  cuisines: string[];
  yearsExperience: number;
}

export interface Flat {
  id: string;
  name: string;
  address: string;
  cookId: string;
  inviteCode: string;
  flatmateIds: string[];
  philosophy?: string;
}

export interface Flatmate {
  id: string;
  name: string;
  photo: string;
  phone: string;
  flatId: string | null;
  dietType: DietType;
  spiceTolerance: SpiceTolerance;
  cuisines: string[];
  allergies: string[];
  dislikes: string[];
  likes: string[];
  role?: string; // e.g. "Primary Chef", "Epicurean Guest" — for flair
}

export interface Recipe {
  id: string;
  name: string;
  cuisine: string;
  dietType: DietType;
  mealTime: MealTime;
  prepMinutes: number;
  cookMinutes: number;
  calories: number;
  ingredients: string[];
  chefNote: string;
  photo: string;
  tags: string[]; // e.g. ["Low-spice", "Flatmate Favorite"]
  cookCount: number; // how many times cooked in any flat
  isCustom: boolean;
}

export interface PlanSlot {
  recipeId: string | null;
  isFrozen: boolean;
  status: PlanStatus; // only "published" matters for flatmate-side visibility
}

export type PlanGrid = Record<string, Record<MealTime, PlanSlot>>; // date YYYY-MM-DD → meal → slot

export interface Suggestion {
  id: string;
  flatId: string;
  fromFlatmateId: string;
  recipeId: string | null; // null if free-text "Surprise Me!"
  dishName: string;
  note: string;
  tag: "healthy" | "spicy" | "comfort" | "surprise";
  status: SuggestionStatus;
  declineReason?: string;
  createdAt: string; // ISO
}

export type Persona =
  | { type: "cook"; cookId: string }
  | { type: "flatmate"; flatmateId: string }
  | null;

export interface AppState {
  persona: Persona;
  cooks: Cook[];
  flats: Flat[];
  flatmates: Flatmate[];
  recipes: Recipe[];
  suggestions: Suggestion[];
  plans: Record<string, PlanGrid>; // flatId → date-keyed grid
}
