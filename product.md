 Prompt:

  Design a distinctive, editorial-feeling desktop web app called BiteBuddy — a meal coordination tool that sits between
  Indian flatmates and their hired cook, so the cook always knows what to make tomorrow and flatmates never argue about
  "kya khana hai?".

  Product context
  - Two personas with separate onboarding and homes: Flatmate and Cook.
  - A Flat has 2–6 flatmates and 1 hired cook. A Cook can serve multiple flats and switches between them.
  - A food engine generates tomorrow's three meals only (B/L/D), drawing from a Recipe Library seeded with ~50 curated
  Indian recipes and extensible by the cook or flatmates. Engine respects aggregated preferences, allergies, and any slots
  the cook has frozen.
  - Cook reviews tomorrow's suggestions, regenerates or overrides individual slots, freezes what they like, and publishes
  to the flat. Past and today's meals are read-only once published.
  - Flatmates see the published plan and can suggest dishes, which land in the cook's inbox.
  - Auth: phone OTP only.
  - NOT in v1: inventory, grocery lists, auto-ordering, payment splitting.

  Platform & layout
  - Desktop-first. Target breakpoint ≈ 1440×900. Use the canvas: persistent left sidebar nav, generous content area, inline
   side-panels (don't hide content behind tab switches when it fits on screen).
  - Responsive down to tablet. Mobile is a secondary "view-mostly" experience — the cook planner is explicitly
  desktop-primary.

  ---
  Screens — Flatmate persona

  1. Welcome / Sign-in — full-bleed editorial hero with tasteful food photography or illustrated pattern on one half, auth
  panel on the other. Phone OTP. First-run role picker ("I'm a flatmate" / "I'm a cook") as a clean split card.
  2. Flatmate Onboarding (multi-step, progress rail on the left)
    - Name + profile photo.
    - Join a flat via invite code / link, or create a flat and invite others + the cook.
    - Food profile — veg / non-veg / egg-itarian, spice tolerance, favourite cuisines (chips).
    - Allergies & dislikes (free-text chips).
  3. Home / This Week (read-only)
    - Full Mon–Sat × B/L/D grid as the centrepiece. Sunday column = tasteful "Off day 🌴" state.
    - Today column highlighted; future-future days dimmed; past days immutable.
    - Each cell: dish name, rich recipe photo when available, cuisine tag, 🔒 for frozen meals.
    - Right-side panel slides in on cell click → Recipe Detail (photo, ingredients-light, notes, history). Grid stays
  visible behind it.
    - Prominent "💡 Suggest a dish" action in the top-right.
  4. My Suggestions — dishes I've suggested, status chips (pending / accepted / declined), with the cook's decline reason
  inline.
  5. Flatmates — avatar grid / table hybrid. Each row: photo, name, diet summary, allergies, "view preferences" expands
  inline. Any flatmate can invite others and leave voluntarily.
  6. My Preferences — two-column form: preferences on the left, live "how the cook sees me" preview card on the right.

  ---
  Screens — Cook persona

  7. Cook Onboarding — name + photo, cuisines you specialise in, years of experience (optional). Empty landing: "No flats
  yet — waiting for an invite."
  8. Cook Home — My Flats — large card gallery of flats the cook serves. Each card: flat name, # flatmates, today's three
  meals as mini-thumbnails, status pill ("Tomorrow: not yet generated" / "Ready to publish" / "Published"). Click → that
  flat's planner.
  9. Tomorrow's Plan (Cook planner, the hero desktop screen)
    - Three-column layout for B/L/D as big hero cards with photo, dish name, reasoning chips ("picked because: veg,
  low-spice, not cooked in 8 days").
    - Each card has inline 🔄 Regenerate slot, 🔒 Freeze, ✏️  Override.
    - Override opens an inline combobox — typing prefix-matches the Recipe Library ("pan" → Paneer Butter Masala, Pancakes)
   with thumbnails; bottom row is always "+ Create new recipe", which adds to the library and slots it.
    - Left sidebar: Preferences summary panel, always visible on desktop — "4 flatmates · 2 veg · 1 no mushrooms · 1 jain ·
   spice: medium", with clickable chips to see who.
    - Top-right: "Generate tomorrow" primary CTA; once generated, becomes "Publish to flatmates" (disabled until all three
  slots filled).
  10. Week View (Cook) — full Mon–Sat × B/L/D grid, same as flatmate, but with publish status and ability to jump into the
  Tomorrow's Plan screen. Past is archival.
  11. Recipe Library — two-pane layout: filter/search rail on the left (cuisine, veg/non-veg, meal type, custom-only
  toggle), card grid on the right. Clicking a recipe opens a side drawer with Recipe Detail (photo, ingredients-light,
  tags, notes, "cooked 6 times in this flat"), edit/delete for custom recipes only.
  12. Add / Edit Recipe (modal) — dish name, tags, photo upload with drag-drop, ingredients-light, notes. No date/slot —
  pure library seeding.
  13. Suggestions Inbox (Cook) — list/table of flatmate suggestions across all flats, grouped by flat. Actions: Accept
  (adds to library + optionally slots into tomorrow), Decline (optional reason).
  14. Cook Preferences — profile, notifications, manage flats.

  ---
  Moments to highlight
  - Side-by-side Flatmate Home vs Cook Tomorrow's Plan on the same flat, showing the read/write role distinction.
  - Empty states: brand-new flat (library seeded, no plan yet), zero suggestions inbox, zero flats for a new cook.
  - Dark-mode variants of both home screens and the cook planner.

  ---
  Design direction — make it feel distinctive, not another SaaS template

  - Aesthetic reference: imagine Food52 × Arc Browser × Linear. Editorial, a touch of craft, quiet confidence. Absolutely
  avoid generic "AI SaaS" purple gradients, stock hero illustrations, or Swiggy's bright-orange commerce feel.
  - Palette: warm, grounded, slightly unexpected. A deep saffron or tomato primary, a muted clay or sage secondary, rich
  off-white (#FBF7F2-ish) canvas, charcoal text. One crisp accent for CTAs. Cook persona gets a subtly deeper or cooler
  accent shift so the role feels tonally different without re-theming.
  - Typography: pair a confident display serif (e.g., something like Fraunces, GT Sectra, or Canela) for headlines and meal
   names, with a clean geometric sans (e.g., Inter, General Sans) for UI. Generous sizes — desktop should breathe.
  - Layout: asymmetric and editorial where it fits (onboarding, empty states, recipe detail). Structured and functional
  where it matters (planner, library). Use whitespace like a magazine, not a dashboard.
  - Components: rounded-2xl cards with soft, layered shadows; thin 1px hairlines; tasteful use of grain/paper texture on
  hero surfaces; photo-forward recipe cards; subtle micro-illustrations or hand-drawn dividers for warmth (avoid cartoon
  mascots).
  - Iconography: custom-feeling line icons with rounded corners; meal-type emoji (🍳🍛🍲) used sparingly as accents, not
  decoration overload.
  - Motion: slow, deliberate — cards lift on hover, cell click fades in the side panel, regenerate shuffles with a gentle
  card-flip. Nothing bouncy.
  - Micro-delights: Hinglish empty-state copy ("Abhi tak kuch plan nahi hai — let's fix that"), a tasteful confetti
  sprinkle when the cook publishes, a "Sunday is off 🌴" tile that feels intentional.

  ---
  Deliverables
  High-fidelity desktop mockups (1440-wide) for every screen above, with empty + filled states where meaningful, dark-mode
  variants of both home screens and the cook planner, and the flatmate-vs-cook side-by-side comparison. Tablet variants for
   Home and Cook Planner as bonus.