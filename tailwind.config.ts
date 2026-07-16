import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
        },
        neutral: {
          50: "var(--color-neutral-50)",
          100: "var(--color-neutral-100)",
          200: "var(--color-neutral-200)",
          300: "var(--color-neutral-300)",
          400: "var(--color-neutral-400)",
          500: "var(--color-neutral-500)",
          600: "var(--color-neutral-600)",
          700: "var(--color-neutral-700)",
          800: "var(--color-neutral-800)",
          900: "var(--color-neutral-900)",
          950: "var(--color-neutral-950)",
        },
        success: {
          50: "var(--color-success-50)",
          100: "var(--color-success-100)",
          500: "var(--color-success-500)",
          600: "var(--color-success-600)",
        },
        warning: {
          50: "var(--color-warning-50)",
          100: "var(--color-warning-100)",
          500: "var(--color-warning-500)",
          600: "var(--color-warning-600)",
        },
        error: {
          50: "var(--color-error-50)",
          100: "var(--color-error-100)",
          500: "var(--color-error-500)",
          600: "var(--color-error-600)",
        },
        info: {
          50: "var(--color-info-50)",
          100: "var(--color-info-100)",
          500: "var(--color-info-500)",
          600: "var(--color-info-600)",
        },
        /* On-gradient / overlay aliases — content on primary gradients & scrims.
           Usage: text-on-primary, text-on-primary-muted, bg-on-primary-surface,
           hover:bg-on-primary-surface-hover, border-on-primary-border, bg-scrim */
        "on-primary": {
          DEFAULT: "var(--color-text-on-primary)",
          muted: "var(--color-text-on-primary-muted)",
          surface: "var(--color-surface-on-primary)",
          "surface-hover": "var(--color-surface-on-primary-hover)",
          border: "var(--color-border-on-primary)",
        },
        scrim: "var(--color-scrim)",
      },
      fontFamily: {
        sans: ["var(--font-family)"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      spacing: {
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        "2xl": "var(--spacing-2xl)",
        "3xl": "var(--spacing-3xl)",
      },
    },
  },
  plugins: [],
};

export default config;
