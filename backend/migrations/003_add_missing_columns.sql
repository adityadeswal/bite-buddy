-- Live DB is missing the list columns the service layer expects.
-- Add them with empty-array defaults so existing rows stay valid.

ALTER TABLE flat
    ADD COLUMN IF NOT EXISTS recipes TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE flatmate
    ADD COLUMN IF NOT EXISTS diet_types diet_type[] NOT NULL DEFAULT '{}';

ALTER TABLE flatmate
    ADD COLUMN IF NOT EXISTS like_recipes TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE flatmate
    ADD COLUMN IF NOT EXISTS dislike_recipes TEXT[] NOT NULL DEFAULT '{}';
