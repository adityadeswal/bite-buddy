from typing import Dict, Tuple
from datetime import date

from entities import Flat, Flatmate, FlatmateAvailability, Recipe, Cook, FlatAction

flats: Dict[str, Flat] = {}
flatmates: Dict[str, Flatmate] = {}
recipes: Dict[str, Recipe] = {}
cooks: Dict[str, Cook] = {}
# key: (flatmate_id, date_str)
availability: Dict[Tuple[str, str], FlatmateAvailability] = {}
# key: (flat_id, date_str, meal_time)
flat_actions: Dict[Tuple[str, str, str], FlatAction] = {}
