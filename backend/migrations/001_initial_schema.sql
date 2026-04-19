-- Enums
DO $$ BEGIN
    CREATE TYPE meal_time AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE diet_type AS ENUM ('veg', 'non_veg');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Cook (no FK dependencies)
CREATE TABLE IF NOT EXISTS cook (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    is_deleted   BOOLEAN NOT NULL DEFAULT FALSE,
    last_updated DATE NOT NULL,
    created_on   DATE NOT NULL
);

-- Flat
CREATE TABLE IF NOT EXISTS flat (
    id           TEXT PRIMARY KEY,
    address      TEXT NOT NULL,
    cook_id      TEXT NOT NULL REFERENCES cook(id),
    is_deleted   BOOLEAN NOT NULL DEFAULT FALSE,
    last_updated DATE NOT NULL,
    created_on   DATE NOT NULL
);

-- Recipe
CREATE TABLE IF NOT EXISTS recipe (
    id           TEXT PRIMARY KEY,
    meal_time    meal_time NOT NULL,
    photo        TEXT NOT NULL,
    url          TEXT NOT NULL,
    is_deleted   BOOLEAN NOT NULL DEFAULT FALSE,
    last_updated DATE NOT NULL,
    created_on   DATE NOT NULL
);

-- Flatmate
CREATE TABLE IF NOT EXISTS flatmate (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    email        TEXT NOT NULL,
    flat_id      TEXT NOT NULL REFERENCES flat(id),
    is_deleted   BOOLEAN NOT NULL DEFAULT FALSE,
    last_updated DATE NOT NULL,
    created_on   DATE NOT NULL
);

-- Junction: flatmate <-> diet_type
CREATE TABLE IF NOT EXISTS flatmate_diet_type (
    flatmate_id TEXT NOT NULL REFERENCES flatmate(id),
    diet_type   diet_type NOT NULL,
    PRIMARY KEY (flatmate_id, diet_type)
);

-- Junction: flatmate liked/disliked recipes
CREATE TABLE IF NOT EXISTS flatmate_recipe_preference (
    flatmate_id TEXT NOT NULL REFERENCES flatmate(id),
    recipe_id   TEXT NOT NULL REFERENCES recipe(id),
    preference  TEXT NOT NULL CHECK (preference IN ('like', 'dislike')),
    PRIMARY KEY (flatmate_id, recipe_id)
);

-- Junction: flat <-> recipe
CREATE TABLE IF NOT EXISTS flat_recipe (
    flat_id   TEXT NOT NULL REFERENCES flat(id),
    recipe_id TEXT NOT NULL REFERENCES recipe(id),
    PRIMARY KEY (flat_id, recipe_id)
);

-- Junction: recipe <-> diet_type
CREATE TABLE IF NOT EXISTS recipe_diet_type (
    recipe_id TEXT NOT NULL REFERENCES recipe(id),
    diet_type diet_type NOT NULL,
    PRIMARY KEY (recipe_id, diet_type)
);

-- FlatmateAvailability
CREATE TABLE IF NOT EXISTS flatmate_availability (
    flatmate_id  TEXT NOT NULL REFERENCES flatmate(id),
    date         DATE NOT NULL,
    available    BOOLEAN NOT NULL,
    is_deleted   BOOLEAN NOT NULL DEFAULT FALSE,
    last_updated DATE NOT NULL,
    created_on   DATE NOT NULL,
    PRIMARY KEY (flatmate_id, date)
);

-- FlatAction
CREATE TABLE IF NOT EXISTS flat_action (
    flat_id      TEXT NOT NULL REFERENCES flat(id),
    date         DATE NOT NULL,
    meal_time    meal_time NOT NULL,
    is_meal_made BOOLEAN NOT NULL,
    meal_id      TEXT REFERENCES recipe(id),
    is_deleted   BOOLEAN NOT NULL DEFAULT FALSE,
    last_updated DATE NOT NULL,
    created_on   DATE NOT NULL,
    PRIMARY KEY (flat_id, date, meal_time)
);
