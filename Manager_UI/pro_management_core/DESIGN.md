---
name: Pro-Management Core
colors:
  surface: '#faf8ff'
  surface-dim: '#dad9e3'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2fc'
  surface-container: '#eeedf7'
  surface-container-high: '#e8e7f1'
  surface-container-highest: '#e2e1eb'
  on-surface: '#1a1b22'
  on-surface-variant: '#444653'
  inverse-surface: '#2f3037'
  inverse-on-surface: '#f1f0f9'
  outline: '#747684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3456c2'
  primary: '#1b41ae'
  on-primary: '#ffffff'
  primary-container: '#3a5bc7'
  on-primary-container: '#d9dfff'
  inverse-primary: '#b6c4ff'
  secondary: '#525c87'
  on-secondary: '#ffffff'
  secondary-container: '#c2cdfe'
  on-secondary-container: '#4b5680'
  tertiary: '#7c3800'
  on-tertiary: '#ffffff'
  tertiary-container: '#a04b00'
  on-tertiary-container: '#ffd9c4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#001550'
  on-primary-fixed-variant: '#133ca9'
  secondary-fixed: '#dce1ff'
  secondary-fixed-dim: '#bac4f5'
  on-secondary-fixed: '#0d1940'
  on-secondary-fixed-variant: '#3a456e'
  tertiary-fixed: '#ffdbc8'
  tertiary-fixed-dim: '#ffb68b'
  on-tertiary-fixed: '#321300'
  on-tertiary-fixed-variant: '#743400'
  background: '#faf8ff'
  on-background: '#1a1b22'
  surface-variant: '#e2e1eb'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  body-md-mobile:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  stack-sm: 4px
  stack-md: 12px
  stack-lg: 24px
---

## Brand & Style
The design system is engineered for high-density information management within the property tech sector. It prioritizes clarity, efficiency, and professional reliability to help property managers oversee large-scale boarding house operations.

The style is **Modern Corporate Minimalism**. It utilizes a "functional aesthetic" where every element serves a purpose in the workflow. By leaning into heavy whitespace and a restricted color palette, the system reduces cognitive load during complex tasks like contract management and financial reporting. The interface feels institutional yet accessible, moving away from legacy software toward a streamlined, enterprise-grade SaaS experience.

## Colors
The palette is rooted in a trustworthy "Trust Blue" (#3A5BC7), used purposefully for primary actions and brand presence. 

- **Primary**: Used for active states, primary buttons, and critical navigation highlights.
- **Secondary Background**: A cool-toned neutral (#F5F7FB) used to differentiate the workspace from the sidebar and header.
- **Surface**: Pure White (#FFFFFF) is reserved for data cards and input areas to ensure maximum contrast.
- **Semantic Palette**: Success (Green), Warning (Amber), and Error (Red) use industry-standard hues but are calibrated for legibility against white backgrounds.

## Typography
This design system uses **Inter** exclusively to maintain a systematic, utilitarian feel. The hierarchy is optimized for data-rich environments:

- **Headlines**: Use tighter letter-spacing and heavier weights to anchor sections.
- **Body Text**: Optimized at 14px and 16px for long-form reading of contracts and tenant details.
- **Labels**: Utilize a slightly smaller, medium-weight font for table headers and form captions to distinguish them from user-generated data.
- **Vietnamese Support**: Special attention is given to line-heights (1.5x) to prevent diacritics from clashing across lines.

## Layout & Spacing
The layout follows a **12-column fluid grid** system for the main content area, with a fixed-width sidebar (280px) for navigation.

- **Grid**: 24px gutters provide ample breathing room between data widgets.
- **Rhythm**: All spacing is derived from an 8px base unit. 
- **Adaptation**: On tablet, the sidebar collapses into an icon-only rail or a hamburger menu. On mobile, the 12-column grid collapses into a single-column stack with 16px side margins.
- **Padding**: Cards and containers use 24px internal padding to maintain a premium, uncluttered feel.

## Elevation & Depth
Depth is handled through **Low-contrast outlines** combined with **Ambient shadows**. This prevents the UI from looking "flat" while avoiding the heaviness of traditional shadows.

- **Level 0 (Floor)**: Secondary Background (#F5F7FB).
- **Level 1 (Cards)**: White background, 1px border (#E2E8F0), and a soft shadow (0px 4px 6px -1px rgba(0, 0, 0, 0.05)).
- **Level 2 (Dropdowns/Modals)**: White background, 1px border, and a more pronounced elevation shadow (0px 10px 15px -3px rgba(0, 0, 0, 0.1)).
- **Active State**: Use the primary color as a subtle 2px glow or border to indicate focus.

## Shapes
The shape language is disciplined and geometric. 

A **Soft (0.5rem / 8px)** corner radius is applied to all primary containers, including buttons, input fields, and dashboard cards. This radius strikes a balance between the friendliness of a modern SaaS and the rigidity of an enterprise tool. 

- **Small elements** (Tags/Chips): 4px radius.
- **Interactive elements** (Buttons/Inputs): 8px radius.
- **Large containers** (Modals): 12px radius.

## Components
Consistent component behavior ensures the property management workflow remains intuitive.

- **Buttons**: Primary buttons are solid #3A5BC7 with white text. Secondary buttons use a white fill with a #E2E8F0 border.
- **Input Fields**: 8px border radius, 1px solid #E2E8F0. Focus state uses a 1px #3A5BC7 border with a light blue tinted halo.
- **Status Chips**: Used for room availability (e.g., "Trống", "Đã thuê"). They use a light background of the semantic color (e.g., Light Green background for "Success") with dark bold text of the same hue.
- **Data Tables**: Zebra striping is avoided; instead, use thin 1px horizontal dividers. Headers are uppercase `label-md` with #64748B color.
- **Cards**: The primary layout unit. Each card should have a clear title in `title-lg` and use 24px padding.
- **Navigation**: Sidebar items use 12px padding and a subtle background change on hover, with a 4px vertical "active indicator" line on the left side of the selected item.