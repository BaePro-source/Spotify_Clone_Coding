/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: "#1DB954",
          black: "#121212",
          dark: "#181818",
          card: "#282828",
          hover: "#3E3E3E",
          muted: "#B3B3B3",
        },
      },
    },
  },
  plugins: [],
};
