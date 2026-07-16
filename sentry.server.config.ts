// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://a877a1a973a6af2cf0afbeac1976fd0e@o4511742850367488.ingest.us.sentry.io/4511742861574144",

  // Only report errors from production deploys
  enabled: process.env.NODE_ENV === "production",

  dataCollection: {
    // userInfo: false,
    // httpBodies: [],
  },
});