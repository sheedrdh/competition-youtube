/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts}"],
  theme: {
    extend: {
      colors: {
        ink: "#080604",
        coal: "#14100b",
        bone: "#f5ecdd",
        smoke: "#c3b092",
        fog: "#7d6c52",
        line: "rgba(215, 170, 102, 0.18)",
        signal: "#c88f4a",
        cyan: "#67f0e7"
      },
      fontFamily: {
        sans: ["Syne", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Instrument Serif", "ui-serif", "Georgia", "serif"]
      },
      boxShadow: {
        glow: "0 0 90px rgba(200, 143, 74, 0.18)",
        scan: "0 0 42px rgba(103, 240, 231, 0.22)"
      }
    }
  },
  plugins: []
};
