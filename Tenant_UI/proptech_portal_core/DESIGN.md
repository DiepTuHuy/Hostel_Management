---
name: PropTech Portal Core
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444653'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#747684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3456c2'
  primary: '#1b41ae'
  on-primary: '#ffffff'
  primary-container: '#3a5bc7'
  on-primary-container: '#d9dfff'
  inverse-primary: '#b6c4ff'
  secondary: '#006e2f'
  on-secondary: '#ffffff'
  secondary-container: '#6bff8f'
  on-secondary-container: '#007432'
  tertiary: '#6c4300'
  on-tertiary: '#ffffff'
  tertiary-container: '#8c5800'
  on-tertiary-container: '#ffdab2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#001550'
  on-primary-fixed-variant: '#133ca9'
  secondary-fixed: '#6bff8f'
  secondary-fixed-dim: '#4ae176'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005321'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  surface-ice: '#F8FAFC'
  surface-soft: '#F1F5F9'
  text-heading: '#0F172A'
  text-body: '#334155'
  border-light: '#E2E8F0'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  section-gap: 80px
---

## Brand & Style

This design system is engineered for a high-performance PropTech portal, balancing the authoritative reliability of real estate investment with the warm, inviting atmosphere of hospitality. The aesthetic follows a **Modern / Corporate** direction with strong **Minimalist** influences. 

The visual narrative prioritizes clarity, high-quality imagery, and effortless navigation. It aims to evoke "Tranquility" and "Confidence" in users looking for their next home or investment. To achieve a premium feel, the design system utilizes generous whitespace, subtle depth through soft shadows, and a restrained but purposeful color application that guides the user toward conversion points without visual fatigue.

## Colors

The palette is anchored by a deep, trustworthy blue (`#3A5BC7`) as the primary brand color, used for core actions and navigation elements. An energetic green (`#22C55E`) serves as the secondary accent, specifically reserved for "Success" states, price highlights, and "Book Now" triggers to maximize conversion visibility.

The background logic relies on "Surface Tiers":
- **Primary Surface:** Pure `#FFFFFF` for content cards and white-space blocks.
- **Secondary Surface:** `#F8FAFC` for page backgrounds to provide subtle contrast against white cards.
- **Tertiary Surface:** `#F1F5F9` for structural elements like headers and footers.

Neutral tones are pulled from a cool slate palette to maintain a crisp, modern feel, avoiding the "muddy" look of warm grays.

## Typography

The design system exclusively utilizes **Inter** to ensure maximum readability and a technical, clean-cut personality across all Vietnamese diacritics. 

**Scale Strategy:**
- **Marketing Headlines:** Use `display-lg` with tight letter-spacing to create impact on landing pages.
- **Hierarchy:** Maintain a clear distinction between `headline-md` (Property titles) and `body-md` (Descriptions).
- **Price Display:** Use `headline-lg` with `fontWeight: 700` and the secondary accent color for maximum visibility in Room Cards.
- **Navigation:** Labels should use `label-md` with semi-bold weights to ensure they stand out against functional icons.

## Layout & Spacing

The layout is built on a **12-column fixed grid** for desktop, centering content within a 1280px container. 

**Responsive Rules:**
- **Desktop:** 12 columns, 24px gutters, 40px side margins.
- **Tablet:** 8 columns, 16px gutters, 24px side margins.
- **Mobile:** 4 columns, 16px gutters, 16px side margins.

Spacing follows an 8px base unit. Section gaps are generous (80px or 10rem) to maintain the premium, airy feel of the portal. Use padding-based spacing for cards to ensure content never touches the edges of the container.

## Elevation & Depth

This design system uses **Ambient Shadows** and **Tonal Layers** to establish hierarchy. Surfaces are categorized into three levels:

1.  **Level 0 (Floor):** `#F8FAFC` background.
2.  **Level 1 (Card):** `#FFFFFF` with a very soft, diffused shadow (`0px 4px 20px rgba(0, 0, 0, 0.05)`). Used for Room Cards and standard UI sections.
3.  **Level 2 (Interaction):** `#FFFFFF` with a more pronounced shadow (`0px 10px 30px rgba(0, 0, 0, 0.1)`) used for hover states on property cards and active Search Widgets.

Avoid harsh borders. Instead, use thin 1px lines in `border-light` (`#E2E8F0`) only when structural separation is required without increasing elevation.

## Shapes

The shape language is **Rounded**, conveying friendliness and modernity. 

- **Cards & Widgets:** Use `rounded-lg` (16px) to create a soft, container-like feel that frames photography beautifully.
- **Buttons & Inputs:** Use `rounded-md` (8px) for a more precise, functional look.
- **Search Bars:** The primary search widget should utilize a "Pill" shape (999px) to mimic the approachable search experience popularized by global travel platforms.
- **Images:** All property imagery must carry the `rounded-lg` corner radius to match the card containers.

## Components

### Public-Facing Navigation (Header)
The header is high-visibility and sticky. It features a centered, condensed **Search Focus** trigger that expands into a full widget on click. Navigation links are minimal, prioritizing "List your property" and "User Profile."

### Room Cards (High-Conversion)
- **Image:** 4:3 aspect ratio with a subtle overlay for "Favorite" icons.
- **Price:** Located at the bottom-left, using `headline-md` in `primary` or `secondary` color.
- **Badging:** Small, semi-transparent chips in the top-left for "Verified" or "New" status.
- **Information:** Limited to Title, Location (with icon), and 2-3 key attributes (e.g., Bedrooms, Area).

### Search Widgets
The search widget uses a segmented approach (Location | Date | Guests) separated by vertical dividers. Upon focus, the segment expands with a light-blue tint to indicate activity.

### SEO-Friendly Footer
A multi-column footer using `surface-soft`. It includes deep-link clusters (e.g., "Hà Nội Apartments," "HCM Villas") using `label-sm` to maintain a clean appearance while maximizing keyword density.

### Inputs & Buttons
Inputs use a 1px border that thickens and changes to `primary_color_hex` on focus. Primary buttons use a solid fill with white text, while secondary buttons use a ghost style with a `primary` border.