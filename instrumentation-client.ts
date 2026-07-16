// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://a877a1a973a6af2cf0afbeac1976fd0e@o4511742850367488.ingest.us.sentry.io/4511742861574144",

  // Only report errors from production deploys — skips localhost dev + Vercel preview URLs
  enabled:
    process.env.NODE_ENV === "production" &&
    typeof window !== "undefined" &&
    window.location.hostname === "zionsvilleindiana.com",

  dataCollection: {
    // userInfo: false,
    // httpBodies: [],
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;