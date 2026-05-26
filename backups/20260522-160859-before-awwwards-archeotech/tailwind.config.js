/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts}"],
  theme: {
    extend: {
      colors: {
        ink: "#050813",
        coal: "#08111f",
        bone: "#eef6ff",
        smoke: "#91a9c8",
        fog: "#496782",
        line: "rgba(110, 180, 255, 0.16)",
        signal: "#4ea8ff",
        cyan: "#72f3ff"
      },
      fontFamily: {
        sans: ["Syne", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Instrument Serif", "ui-serif", "Georgia", "serif"]
      },
      boxShadow: {
        glow: "0 0 90px rgba(78, 168, 255, 0.16)",
        scan: "0 0 40px rgba(114, 243, 255, 0.2)"
      }
    }
  },
  plugins: []
};
