import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#17191c",
          pure: "#000000",
        },
        paper: {
          DEFAULT: "#ffffff",
        },
        mist: {
          DEFAULT: "#f2f2f3",
          dark: "#e4e4e7",
        },
        fog: {
          DEFAULT: "#fafafb",
        },
        slate: {
          DEFAULT: "#777b86",
          dark: "#555963",
        },
        ash: {
          DEFAULT: "#979799",
        },
        smoke: {
          DEFAULT: "#a3a6af",
        },
        blush: {
          DEFAULT: "#fbe1d1",
          hover: "#f8cfb7",
          light: "#fdf3eb",
        },
        sienna: {
          DEFAULT: "#5d2a1a",
          dark: "#3d1b10",
        },
        // GIS Semantic Overlay Colors
        status: {
          approved: "#10b981",
          pending: "#f59e0b",
          conflict: "#ef4444",
          info: "#3b82f6",
        }
      },
      borderRadius: {
        card: "24px",
        input: "16px",
        pill: "9999px",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      boxShadow: {
        editorial: "0 4px 20px -2px rgba(23, 25, 28, 0.05)",
        card: "0 2px 12px -1px rgba(23, 25, 28, 0.04)",
        dropdown: "0 10px 30px -5px rgba(23, 25, 28, 0.1)",
      }
    },
  },
  plugins: [],
};

export default config;
