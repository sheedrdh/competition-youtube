/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts}"],
  theme: {
    extend: {
      colors: {
        ink: "#090706",
        coal: "#13100c",
        bone: "#f3eadb",
        smoke: "#bca98c",
        fog: "#7b6b53",
        line: "rgba(212, 170, 103, 0.18)",
        signal: "#c89149",
        cyan: "#69f0e7"
      },
      fontFamily: {
        sans: ["Syne", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Instrument Serif", "ui-serif", "Georgia", "serif"]
      },
      boxShadow: {
        glow: "0 0 90px rgba(200, 145, 73, 0.16)",
        scan: "0 0 40px rgba(105, 240, 231, 0.18)"
      }
    }
  },
  plugins: []
};
