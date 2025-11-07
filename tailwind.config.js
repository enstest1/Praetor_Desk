/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#0e121a",
        panel: "#111827",
        border: "rgba(255, 255, 255, 0.1)",
        primary: "#3b82f6",
        success: "#10b981",
        warn: "#f59e0b",
        danger: "#ef4444",
      },
      borderRadius: {
        'panel': '1rem', // rounded-2xl
        'input': '0.75rem', // rounded-xl
        'pill': '9999px', // rounded-full
      },
      boxShadow: {
        'soft': '0 10px 30px -10px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}

