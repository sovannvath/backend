import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8080,
    allowedHosts: [
      "vmwgjq-8080.csb.app", // Add this line
      "localhost", // Keep localhost if you also run locally
      // Add any other hosts you might use
    ],
  },
  plugins: [react( )],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
