 Prompt:                                                                                                                  
                                                                                                                           
  Design a clean, friendly mobile-first web app called Bite-Buddy — a meal coordination app that sits between Indian 
  flatmates and their hired cook, so the cook always knows what to make tomorrow and flatmates never argue about "kya khana
   hai?".
                                                                                                                           
  Product context                                    
  - Two distinct personas: Flatmate and Cook. Each has its own onboarding and home screen.
  - A Flat has 2–6 flatmates and 1 hired cook. A Cook can serve multiple flats and switches between them.                  
  - A food engine generates tomorrow's three meals only (B/L/D), drawing from a Recipe Library that ships with ~50 curated
  Indian recipes and can be extended by the cook or flatmates. The engine respects aggregated preferences, allergies, and  
  any meals the cook has frozen.                                                                                           
  - The cook reviews tomorrow's suggestions, regenerates or overrides individual slots, freezes what they like, and        
  publishes for the flat. Past and today's meals are read-only once published.                                             
  - Flatmates see the published plan and can suggest dishes, which land in the cook's inbox.                               
  - Auth: phone OTP only.                                                                   
  - NOT in v1: inventory, grocery lists, auto-ordering, payment splitting.                                                 
                                                                                                                           
  ---                                                                                                                      
  Screens — Flatmate persona                                                                                               
                                                                                                                           
  1. Welcome / Sign-in — warm hero, tagline "Never argue about dinner again", phone OTP. First-run role picker: "I'm a     
  flatmate" / "I'm a cook".                                                                                                
  2. Flatmate Onboarding (progress dots)
    - Name + profile photo.                                                                                                
    - Join a flat via invite code / link (or create one and invite others + the cook).
    - Food profile — veg / non-veg / egg-itarian, spice tolerance, favourite cuisines (chips).                             
    - Allergies & dislikes (free-text chips).                                                                              
  3. Home / This Week (read-only)                                                                                          
    - Grid: Mon–Sat × Breakfast / Lunch / Dinner. Sunday row = "Off day 🌴" state.                                         
    - Today's row highlighted. Future days beyond tomorrow are dimmed/awaiting-generation. Past days are immutable.        
    - Each cell: dish name + emoji/icon + photo if available. 🔒 icon on frozen meals.                                     
    - Tap a cell → Recipe Detail.                                                                                          
    - Floating "💡 Suggest a dish" CTA → opens a sheet to send a request to the cook.                                      
  4. My Suggestions — dishes I've suggested, with status (pending / accepted / declined).                                  
  5. Flatmates — avatars + food profile summary, preferences detail. Any flatmate can invite others and leave the flat     
  voluntarily.                                                                                                             
  6. My Preferences — edit onboarding answers, notification toggles.                                                       
                                                                                                                           
  ---                                                
  Screens — Cook persona                                                                                                   
                                                     
  7. Cook Onboarding — name + photo, cuisines you specialise in, years of experience (optional). Landing state: "No flats
  yet — wait for a flatmate to invite you."                                                                                
  8. Cook Home — My Flats — card list of flats the cook serves. Each card: flat name, # flatmates, today's three meals,
  status pill ("Tomorrow: not yet generated" / "Tomorrow: ready to publish" / "Tomorrow: published"). Tap → that flat's    
  planner.                                           
  9. Tomorrow's Plan (Cook planner) — the core screen.                                                                     
    - Header shows tomorrow's date and a "🔄 Generate tomorrow" primary CTA (or "Regenerate" once generated).              
    - Three big cards: Breakfast / Lunch / Dinner. Each card has the engine's pick with photo, and inline actions: 🔄      
  Regenerate this slot, 🔒 Freeze, ✏️  Override.                                                                            
    - Override opens a searchable picker — typing prefix-matches the Recipe Library ("pan" → Paneer Butter Masala,         
  Pancakes); bottom row is always "+ Create new recipe" which adds to the library and slots it.                            
    - Preferences summary panel (collapsible, pinned at top): "4 flatmates · 2 veg · 1 no mushrooms · 1 jain · spice:
  medium". The cook's at-a-glance truth source.                                                                            
    - Sticky footer: "Publish to flatmates" (disabled until all three slots filled).
  10. Week view (Cook) — same Mon–Sat grid as flatmate home, but cells show publish status and history. Read-only for past;
   tomorrow's row is editable via the Tomorrow's Plan screen.                                                              
  11. Recipe Library — searchable, filterable list (veg/non-veg, cuisine, meal type). Default 50-recipe seed is pre-loaded;
   flat-custom recipes shown with a small "custom" tag. Tap → Recipe Detail: photo, ingredients-light, tags, notes, cook   
  history ("cooked 6 times in this flat"), edit/delete (custom only).
  12. Add / Edit Recipe (bottom sheet) — dish name, tags (veg/non-veg, cuisine, meal type), photo (optional),              
  ingredients-light, notes. No date/slot here — this is pure library seeding.                                              
  13. Suggestions Inbox (Cook) — flatmate suggestions across all flats, grouped by flat. Each card: dish, requested-by,
  note. Actions: Accept (adds to library if new + optionally slot into tomorrow), Decline (optional reason).               
  14. Cook Preferences — profile, notifications, manage flats (view / leave).
                                                                                                                           
  ---                                                
  Key cross-persona moments to show                                                                                        
  - Flatmate Home vs Cook "Tomorrow's Plan" side-by-side, same flat, to demonstrate the read/write role distinction.
  - Empty states: brand-new flat (library seeded, no plan yet), cook inbox with zero suggestions, flatmate with no  
  suggestions sent.                                                                                                        
  - Dark-mode variant of both home screens.                                                                                
                                                                                                                           
  ---                                                                                                                      
  Design direction                                   
  - Aesthetic: modern, warm, slightly playful. Notion × Swiggy × Linear. Avoid stock "AI SaaS" gradients and generic       
  purple.                                                                                                           
  - Palette: warm primary (turmeric/saffron or tomato), soft off-white background, deep charcoal text, single accent for   
  CTAs. Cook screens use a subtly distinct accent so the role feels visually different without a full re-theme.         
  - Typography: clean sans-serif, generous line-height, bold readable headers.                                             
  - Components: rounded-xl cards, soft shadows, subtle dividers, emoji accents for meal types (🍳🍛🍲), clear
  lock/regenerate iconography.                                                                                             
  - Micro-delights: Hinglish empty states ("Abhi tak kuch plan nahi hai — let's fix that"), gentle confetti when the cook  
  publishes tomorrow's plan, "Sunday is off 🌴" tile.                                                                      
  - Mobile-first, fully responsive; desktop expands the grid intentionally.                                                
                                                     
  ---                                                                                                                      
  Deliverables                                       
  High-fidelity mockups for every screen above, with empty + filled states where meaningful, both home screens in dark
  mode, and the flatmate-vs-cook side-by-side comparison.                                                             
      