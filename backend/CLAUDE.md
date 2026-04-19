# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the app

```bash
# Install dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Start the server (either works)
uvicorn main:app --reload
python main.py
```

API: `http://localhost:8000` | Docs: `http://localhost:8000/docs`

## Architecture

This is an early-stage FastAPI backend for a flatmate meal coordination app.

**Core domain model** (all in `entities.py`):
- `DatabaseRecord` — base Pydantic model with soft-delete and timestamp fields; all entities inherit from it
- `Flat` — a shared flat/apartment, has a cook and a list of recipes
- `Flatmate` — belongs to a `Flat`, has diet preferences (`DietType`) and liked/disliked recipes
- `FlatmateAvailability` — tracks whether a flatmate is available on a given date
- `Recipe` — a meal recipe with `MealTime` (breakfast/lunch/dinner/snack) and `DietType` (veg/non_veg)
- `Cook` — the cook associated with a flat
- `FlatAction` — records whether a meal was made for a flat on a given date/mealtime, and which recipe was used

`main.py` is the FastAPI entrypoint. Routes should be added there or in separate router modules imported into `main.py`.
