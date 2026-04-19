-- Drop and recreate recipe table
DROP TABLE IF EXISTS recipe CASCADE;

CREATE TABLE recipe (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    meal_time    meal_time NOT NULL,
    diet_types   diet_type[] NOT NULL DEFAULT '{}',
    photo        TEXT NOT NULL,
    url          TEXT NOT NULL,
    is_deleted   BOOLEAN NOT NULL DEFAULT FALSE,
    last_updated DATE NOT NULL,
    created_on   DATE NOT NULL
);
