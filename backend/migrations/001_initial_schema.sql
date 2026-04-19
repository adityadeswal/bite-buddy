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
    recipes      TEXT[] NOT NULL DEFAULT '{}',
    is_deleted   BOOLEAN NOT NULL DEFAULT FALSE,
    last_updated DATE NOT NULL,
    created_on   DATE NOT NULL
);

-- Recipe
CREATE TABLE IF NOT EXISTS recipe (
    id           TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    meal_time    meal_time NOT NULL,
    diet_types   diet_type[] NOT NULL DEFAULT '{}',
    photo        TEXT NOT NULL,
    url          TEXT NOT NULL,
    is_deleted   BOOLEAN NOT NULL DEFAULT FALSE,
    last_updated DATE NOT NULL,
    created_on   DATE NOT NULL
);

-- Flatmate
CREATE TABLE IF NOT EXISTS flatmate (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    email           TEXT NOT NULL,
    flat_id         TEXT NOT NULL REFERENCES flat(id),
    diet_types      diet_type[] NOT NULL DEFAULT '{}',
    like_recipes    TEXT[] NOT NULL DEFAULT '{}',
    dislike_recipes TEXT[] NOT NULL DEFAULT '{}',
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    last_updated    DATE NOT NULL,
    created_on      DATE NOT NULL
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
