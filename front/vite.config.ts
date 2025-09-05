import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    allowedHosts: ['secure-docs.kucabrice.ovh', 'secure-docs-780131803540.europe-west1.run.app'],
  },
});
