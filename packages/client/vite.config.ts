import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/projects/airbnb/",
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          maps: ["leaflet", "react-leaflet"],
          dates: ["date-fns", "react-date-range"],
        },
      },
    },
  },
});
