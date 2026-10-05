import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Personal Event Tracking",
  description: "Personal Event Tracking",
  outDir: "public",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: "Home", link: "/" }],

    sidebar: [
      {
        text: "Event",
        items: [
          { text: "Theory", link: "/theory" },
          { text: "Event Concepts", link: "/event-concepts"},
          { text: "Current Events", link: "/current-events" },
        ],
      },
      {
        text: "Roles, Responsibility, Requests",
        items: [
          { text: "SQL Table", link: "/docs/sql-statement"}
        ]
      }
    ],

    socialLinks: [
      { icon: "github", link: "https://gitlab.com/Slinkkay/personal-events" },
    ],
  },
});
