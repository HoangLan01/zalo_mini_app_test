---
name: Tùng Thiện Digital Citizen
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fd'
  surface-container: '#ededf8'
  surface-container-high: '#e7e7f2'
  surface-container-highest: '#e1e2ec'
  on-surface: '#191b23'
  on-surface-variant: '#434654'
  inverse-surface: '#2e3038'
  inverse-on-surface: '#f0f0fb'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dfe0e0'
  on-secondary-container: '#616363'
  tertiary: '#7b2600'
  on-tertiary: '#ffffff'
  tertiary-container: '#a33500'
  on-tertiary-container: '#ffc6b2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59b'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#812800'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ec'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  container-padding: 1.25rem
  stack-gap: 1rem
  element-gap: 0.5rem
  section-margin: 2rem
  gutter: 1rem
---

## Brand & Style

The brand identity for this design system is built on the pillar of "Digital Governance with a Human Face." It serves the residents of Phường Tùng Thiện by bridging the gap between bureaucratic necessity and modern technological ease. The personality is authoritative yet approachable—moving away from the cold, rigid structures of traditional government toward a transparent, service-oriented ecosystem.

The visual style is a fusion of **Corporate Modern** and **Glassmorphism**. It utilizes high-fidelity depth to signify a "premium" public service experience. By employing translucent layers and vibrant tech-inspired gradients, the UI creates a sense of openness and "air," reinforcing the core value of transparency. The overall mood is innovative and forward-thinking, signaling to citizens that their local government is evolving alongside the digital age.

## Colors

The palette is anchored by "Tech Blue," a deep, trust-inducing primary shade that transitions into a vibrant cyan. This gradient is used for primary actions, header backgrounds, and status indicators to symbolize progress and connectivity. 

**Pure White** serves as the primary canvas, ensuring maximum readability and a "clean" government feel. **Mint Green** is reserved for positive feedback, success states, and innovative features (like AI assistants or digital IDs), while **Soft Purple** provides a sophisticated highlight for secondary features or cultural/community announcements. The background uses a very subtle off-white (`#F8FAFC`) to reduce eye strain and allow the glassmorphic cards to pop.

## Typography

This design system utilizes **Inter** for its exceptional legibility and neutral, systematic tone. The type scale is optimized for mobile consumption within the Zalo ecosystem. Headlines use tighter letter-spacing and heavier weights to create a strong hierarchy, making it easy for citizens to scan for information. 

Body text is kept at a comfortable 16px for primary reading to ensure accessibility for all age groups. Labels use a slightly increased letter-spacing and medium-to-bold weights to distinguish them from interactive body text. Large headlines (XL) are primarily used for page titles and hero sections, scaling down to LG for standard section headers on mobile screens.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model designed specifically for mobile-first interactions. A 16px (1rem) gutter is the baseline for horizontal rhythm, while 20px (1.25rem) side margins ensure content does not touch the edge of the device screen.

Spacing follows an 8px (0.5rem) incremental scale. Components are grouped using "Stack Gaps" to maintain a clear relationship between elements. Large sections (e.g., separating "Administrative Procedures" from "News") use a generous 32px (2rem) margin to provide visual breathing room, reinforcing the "accessible and calm" mood of the digital environment.

## Elevation & Depth

Hierarchy is achieved through **Glassmorphism** and **Multi-Layered Shadows**. Surfaces are not flat; they exist in a 3D space:

1.  **Level 0 (Background):** A soft gradient or abstract tech pattern with high-frequency blurs.
2.  **Level 1 (Cards):** Semi-transparent white surfaces (`rgba(255, 255, 255, 0.7)`) with a 20px backdrop-blur. These use a very soft, diffused shadow (0px 10px 30px rgba(0, 82, 204, 0.05)).
3.  **Level 2 (Active/Floating):** Primary buttons and active modals use a more pronounced shadow with a hint of the primary blue color (0px 15px 35px rgba(0, 82, 204, 0.15)) to indicate interactivity.

This "Frosted Glass" effect provides a sense of depth and modernity while allowing the brand's abstract background colors to bleed through subtly, maintaining visual continuity.

## Shapes

The shape language is defined by **Large Roundedness**. A cornerstone of this design system is the 24px+ corner radius (represented here as Level 3/Pill-shaped). This radical softness removes the "sharp edges" of government bureaucracy, making the app feel friendly, safe, and citizen-centric. 

Small elements like tags or chips use full-pill rounding, while large containers and modal sheets use a consistent 24px or 32px radius. This consistent curvature creates a cohesive, high-end "tech" aesthetic that feels organic and modern.

## Components

### Buttons
Primary buttons use the Tech Blue gradient with white text and a significant 24px corner radius. They should include a subtle inner glow on the top edge to enhance the 3D "innovative" feel. Secondary buttons use a glassmorphic style: a thin white border with a translucent background.

### Cards
Cards are the primary container. They must feature the 20px backdrop-blur and a 1px white border at 20% opacity to define the edge against the background. Content inside cards should follow the standard spacing units (1.25rem padding).

### Input Fields
Inputs are large (56px height) with a 16px corner radius. They use a soft grey background that turns into a Mint Green border glow when focused, signaling "Technology" and "Innovation."

### Chips & Badges
Used for status (e.g., "Pending," "Completed"). These should be fully pill-shaped. "Success" states use the Mint Green accent with dark text for high contrast.

### Icons
Use modern, thin-stroke line icons (2px stroke). Icons should be encased in a soft-colored circular or "squircle" background to maintain the "premium" feel.

### Progress Indicators
Administrative steps should be displayed using a vertical or horizontal stepper with soft purple highlights for completed stages, symbolizing the journey of the citizen through the service.