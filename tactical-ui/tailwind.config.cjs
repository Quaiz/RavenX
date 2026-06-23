module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#05070a",
        panel:      "#0a0a0a",
        border:     "#1a1a1a",
        primary:    "rgb(var(--color-primary))",
        'primary-dim': "rgba(var(--color-primary), 0.8)",
        hostile:    "#ff3333",
        friendly:   "#00f2ff",
        neutral:    "#4a6176",
        warning:    "#ff9900",
      },
      fontFamily: {
        mono: ["'Share Tech Mono'", "monospace"],
        sans: ["'Rajdhani'", "sans-serif"],
        military: ["'Rajdhani'", "sans-serif"],
        stencil: ['"Bebas Neue"', "sans-serif"],
      },
    },
  },
  plugins: [],
}
