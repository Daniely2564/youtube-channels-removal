/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // Main HTML file
    "./src/**/*.{html,js,ts,jsx,tsx}", // All files in src/ with supported extensions
    "!./src/scripts/*.{js,ts,jsx,tsx}", // Exclude test files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
