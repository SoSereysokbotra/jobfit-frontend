# JobFits Frontend Development Rules

> **Single Source of Truth**: This document dictates the frontend architecture, design system usage, and coding standards for the JobFits platform.

## 1. Design System & Theming

### 1.1 Strict Token Usage (No Hardcoding)
- **NEVER hardcode colors** (e.g., `#240046`, `rgba(0,0,0,0.5)`).
- **NEVER hardcode spacing or sizing values** (e.g., `margin-top: 23px`).
- **NEVER use arbitrary Tailwind values** (e.g., `text-[15px]`, `w-[312px]`).
- All styles must use the variables defined in `src/app/globals.css` via Tailwind utility classes.

### 1.2 Color Palette (The Purple System)
The brand identity is built around a specific purple gradient:
- Primary 900 (Darkest): `#240046`
- Primary 800: `#3C096C`
- Primary 700: `#5A189A`
- Primary 600: `#7B2CBF`
- Primary 500 (Base): `#9D4EDD`

Use semantic mapping:
- Base text: `text-neutral-900`
- Secondary text: `text-neutral-600`
- Primary Button: `bg-primary-600 text-white hover:bg-primary-700`
- Border: `border-neutral-200 focus:border-primary-500`

### 1.3 Typography Scale
- Font family: `Inter`
- Use the defined tailwind classes: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, etc.
- No arbitrary font sizes (`text-[13px]` is forbidden).

## 2. Component Architecture

### 2.1 Reusability First
- Before building a new UI element, consult `/src/app/(marketing)/ui-reference/page.tsx` to see if a component already exists.
- Components must be highly reusable and accept standard React props (`className`, `children`, standard HTML attributes).
- Use `clsx` and `tailwind-merge` for class name composition.

### 2.2 Standard Patterns
- **Buttons**: Consistent padding, radius `rounded-md`, state transitions (`hover`, `active`, `disabled`).
- **Cards**: Background `bg-card`, border `border-border`, shadow `shadow-sm`, radius `rounded-lg`.
- **Inputs**: Consistent height (`py-2.5`), border `border-border`, focus ring (`focus:ring-2 focus:ring-primary-500`).

## 3. Layouts & Responsiveness

### 3.1 Mobile-First Approach
- Start by styling the mobile layout (default Tailwind classes).
- Use breakpoints (`sm:`, `md:`, `lg:`) to enhance for larger screens.
- Standard breakpoints:
  - Mobile: `< 640px`
  - Tablet: `640px - 1024px`
  - Laptop: `1024px - 1440px`
  - Desktop: `> 1440px`

### 3.2 Responsive Navigation Rules
- **Mobile**: Use bottom tab bar (`BottomTabBar`) and hide the sidebar.
- **Desktop**: Use persistent left sidebar (`Sidebar`) and hide the bottom tab bar.

## 4. State & Interactions

### 4.1 Transitions
- All interactive elements must have a transition (`transition-all duration-200`).
- Use standard hover, focus-visible, and active states.

### 4.2 Loading & Empty States
- Always provide a `Skeleton` loader for asynchronous data fetching.
- Always implement an `EmptyState` component for lists/tables with zero results.

## 5. File Structure & Naming

- **Components**: PascalCase (e.g., `JobCard.tsx`)
- **Folders**: kebab-case (e.g., `data-display`, `layout`)
- Keep shared components in `src/shared/components/`.
- Keep feature-specific components in `src/features/<feature>/components/`.
