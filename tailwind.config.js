/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        wave: {
          "0%": { background: "rgba(152, 228, 255, 0.9)" },
          "70%": { background: "rgba(152, 228, 255, 0.2)" },
          "100%": { background: "" },
        },
      },
      animation: {
        wave: "wave 1s ease-in-out",
      },
    },
  },
  plugins: [],
};
