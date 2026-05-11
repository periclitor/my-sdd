import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/my-sdd/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "SDD Agenda Planner",
        short_name: "SDD Planner",
        description:
          "A mobile-first conference agenda planner for browsing tracks and saving your personal schedule offline.",
        theme_color: "#14181d",
        background_color: "#fcfaf7",
        display: "standalone",
        start_url: "/my-sdd/",
        icons: [
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
    }),
  ],
});
