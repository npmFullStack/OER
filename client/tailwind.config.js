module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Lexend", "sans-serif"],
      },
      colors: {
        bgColor: "#F0F8FF", // Light blue-white background
        primary: "#0e326c", // Deep blue for primary elements
        primaryDark: "#0F2C5C", // Darker blue for hover states
        secondary: "#6B9AC4", // Soft blue for accents
        accent: "#D4E6FF", // Very light blue for cards/sections
        textPrimary: "#1E293B", // Dark blue-gray for main text
        textSecondary: "#475569", // Medium blue-gray for secondary text
        cardBg: "#FFFFFF", // Pure white for cards
        borderLight: "#E2E8F0", // Light gray-blue for borders
      },
    },
  },
  plugins: [],
};
