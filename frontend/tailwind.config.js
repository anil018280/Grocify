/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        moss: "#2f6b3d",
        fern: "#eff6ef",
        sand: "#f5efe3",
        ember: "#d76536",
        slate: "#273229",
      },
      boxShadow: {
        card: "0 18px 40px rgba(29, 46, 33, 0.08)",
      },
    },
  },
  plugins: [],
};
