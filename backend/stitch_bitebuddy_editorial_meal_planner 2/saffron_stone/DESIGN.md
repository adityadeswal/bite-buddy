# Design System: The Modern Kitchen Manuscript

## 1. Overview & Creative North Star
This design system is built to transform meal coordination from a chore into a curated ritual. Our Creative North Star is **"The Modern Kitchen Manuscript."** 

We are merging the rigorous, functional precision of a high-end engineering tool (like Linear) with the warm, tactile, and photo-forward editorial spirit of a premium food magazine (like Food52). This system rejects the "app-y" feel of generic grids in favor of intentional asymmetry, expansive white space, and high-contrast typography. We aim for "Quiet Confidence"—a UI that stays out of the way of the food photography but feels bespoke and authoritative when interacted with.

### Breaking the Template
To achieve this editorial feel, we utilize:
- **Exaggerated Whitespace:** Negative space is not "empty"; it is a structural element used to frame content.
- **Intentional Asymmetry:** Labels and data points are often offset or tucked into corners to avoid the predictable "center-aligned" look.
- **The Persona Shift:** The interface breathes differently depending on the user. The "Flatmate" side feels warm and appetizing (Saffron/Tomato), while the "Cook" side shifts to a deeper, more utilitarian "Chef’s Office" vibe (Forest Green).

---

1.  **The "No-Line" Rule:** Prohibit 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background.
2.  **Surface Hierarchy & Nesting:** Treat the UI as stacked sheets of fine paper. Use `surface-container` tiers (Lowest to Highest) to create depth. An inner card (`surface-container-lowest`) should sit on a slightly darker section (`surface-container-low`) to define its importance without a stroke.
3.  **The "Glass & Gradient" Rule:** Use Glassmorphism for floating elements (e.g., a "New Meal" FAB or a sticky navigation bar) using semi-transparent `surface` colors with a 20px backdrop-blur. Main CTAs should use a subtle linear gradient from `primary` (#a83213) to `primary_container` (#ca4a29) to add "soul."
4.  **The Role Shift:** When the user enters "Cook Mode," the `primary` accent tokens are swapped for `tertiary` (#2a674c). The UI moves from a sun-dried tomato warmth to a cool, focused forest green.

---

## 3. Typography
Our typography is a dialogue between the artisanal and the analytical.

- **Display & Headlines (Noto Serif):** This is our "Editorial Voice." Use `display-lg` and `headline-md` for meal names (e.g., "Slow-Cooked Dal Makhani") and page titles. It conveys history and craft.
- **UI & Data (Inter):** This is our "Functional Voice." Used for ingredients, timings, and navigation. Inter’s geometric clarity ensures that even complex meal schedules remain legible.

**Key Rule:** Never use the Serif for UI labels or buttons. Never use the Sans for meal titles. The contrast between the two is what creates the high-end feel.

---

## 4. Elevation & Depth
Hierarchy is achieved through **Tonal Layering** rather than structural shadows.

- **The Layering Principle:** Stack `surface-container` tiers. Place a `surface-container-lowest` card (the "Paper") on a `surface-container-low` background (the "Table"). 
- **Ambient Shadows:** For floating cards, use an extra-diffused shadow: `box-shadow: 0 12px 40px rgba(45, 45, 45, 0.06);`. The shadow must be a tinted version of `on-surface` (#1c1c19), never pure black.
- **The "Ghost Border":** If a border is required for accessibility, use the `outline_variant` (#e0bfb7) at **15% opacity**. It should be felt, not seen.
- **Roundedness:** Use the `xl` (1.5rem) token for main cards and `full` (pill) for buttons to maintain a soft, approachable "handmade" aesthetic.

---

## 5. Components

### Photo-Forward Recipe Cards
- **Styling:** `rounded-xl` (1.5rem) with a 1px "Ghost Border."
- **Layout:** The image occupies the top 70% of the card. Use a `surface-container-lowest` background for the bottom content area.
- **Interaction:** On hover, a subtle `surface_bright` overlay appears with a "View Recipe" label in `label-md`.

### Primary Buttons
- **Styling:** `primary` background, `on_primary` text. `rounded-full`.
- **States:** Hover uses a subtle transition to `primary_container`. 
- **The Signature CTA:** Use a 2px horizontal padding increase over standard Material defaults to give the button a wider, "flatter" high-end look.

### Input Fields
- **Styling:** No bottom line or box. Use `surface_container_low` as the field background with `rounded-md` (0.75rem).
- **Interaction:** On focus, the background shifts to `surface_container_highest` and the label (in `label-sm`) shifts to the `primary` color.

### Empty States (The "Hinglish" Touch)
- **Styling:** Large `display-sm` Serif headings.
- **Copy:** "Nothing cooking today. *Kitchen bilkul khali hai.*"
- **Visual:** Use a single, high-quality isolated icon or illustration in `secondary` (#5c614d) centered with massive padding (80px+).

---

## 6. Do's and Don'ts

### Do
- Use **surface-tinting** for active states. An active menu item should have a `surface-container-high` background rather than a bold highlight.
- Prioritize **large-scale food photography**. The UI is the frame; the food is the art.
- Use **Hinglish** sparingly in empty states and tooltips to ground the app in the flatmates' reality (e.g., "Add a *tadka* to this recipe").

### Don't
- **No 100% Black:** Never use #000000. Use `on_surface` (#1c1c19) for maximum contrast while maintaining warmth.
- **No Divider Lines:** Avoid horizontal rules `<hr>`. Use a 32px or 48px vertical gap from the spacing scale to separate content blocks.
- **No Standard Icons:** Avoid sharp-edged icons. Use line icons with a 1.5pt stroke and `rounded` corners to match the `rounded-2xl` card DNA.
- **No Crowding:** If a screen feels busy, remove an element or increase the `surface` whitespace. The goal is "Magazine," not "Dashboard."