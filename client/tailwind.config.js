/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        wave: {
          "0%": {
            backgroundColor: "rgba(134, 182, 246, 1)",
          },

          "60%": {
            backgroundColor: "rgba(134, 182, 246, 0)",
          },

          "100%": {
            backgroundColor: "",
          },
        },
      },
      animation: {
        wave: "wave 1.2s ease-in-out",
      },
    },
  },
  plugins: [],
};
