/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        caveat: ["Caveat", "cursive"],
        indie: ["Indie Flower", "cursive"],
        patrick: ["Patrick Hand", "cursive"],
        reenie: ["Reenie Beanie", "cursive"],
        shadows: ["Shadows Into Light", "cursive"],
      },
      colors: {
        paper: {
          white: "#FAFAFA",
          cream: "#FFF8DC",
          vintage: "#F4E8D0",
        },
        ink: {
          blue: "#1E40AF",
          black: "#1F2937",
          red: "#DC2626",
          green: "#059669",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
