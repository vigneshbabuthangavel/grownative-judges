import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kidPurple: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          700: "#6d28d9",
          900: "#2e1065",
        },
        kidYellow: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          700: "#a16207",
          900: "#451a03",
        },
        kidOrange: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          700: "#c2410c",
          900: "#431407",
        },
      },
      boxShadow: {
        soft: "0 10px 25px -10px rgba(0,0,0,0.25)",
      },
      borderRadius: {
        none: '0',
        DEFAULT: '0',
        sm: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
        full: '0', // Explicitly kill pills/circles
      },
    },
  },
  plugins: [],
} satisfies Config;
