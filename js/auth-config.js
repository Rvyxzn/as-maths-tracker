/* ============================================================
   Auth configuration
   ------------------------------------------------------------
   Fill these in to switch features on. Everything works without
   them; the app just runs in device-profile mode.

   This file is PUBLIC. It ships to the browser and anyone can
   read it, so only ever put publishable keys here. A Google
   Client ID and a Supabase anon key are both designed to be
   public. A Google client SECRET or a Supabase service_role key
   are NOT: they must never appear in this file, or anywhere else
   in this repository.
   ============================================================ */

const AUTH_CONFIG = {

  /* ---------- Google sign-in ----------
     To create one, at https://console.cloud.google.com/ :

       1. Create a project (or pick an existing one).
       2. APIs & Services > OAuth consent screen. Choose External,
          give it a name and your email, and save. You can leave it
          in Testing mode and add your own account under Test users.
       3. APIs & Services > Credentials > Create credentials
          > OAuth client ID > Web application.
       4. Under "Authorised JavaScript origins" add BOTH:
            https://rvyxzn.github.io
            http://localhost:8080
          Origins only, with no path and no trailing slash.
       5. Copy the Client ID. It ends in .apps.googleusercontent.com
          and there is no secret to copy for this flow.

     Paste it below. Until you do, the Google button renders
     disabled and says it is not configured. */
  GOOGLE_CLIENT_ID: "",

  /* ---------- Supabase (not wired up yet) ----------
     Slots for when you move progress off the device and into the
     cloud. Setting them alone does nothing yet: the storage layer
     in store.js still reads and writes localStorage. See the
     "Moving to Supabase" note at the bottom of js/auth.js for
     what has to change. */
  SUPABASE_URL: "https://hgbyenbvsdlnixmtzmwx.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnYnllbmJ2c2Rsbml4bXR6bXd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0Njc4NjYsImV4cCI6MjEwNDA0Mzg2Nn0.ouf_6w6T8Qy48ftQOvSup5Zt0b-T9zNV0wZ3Q-zdE1M"
};

function googleConfigured() {
  return typeof AUTH_CONFIG.GOOGLE_CLIENT_ID === "string" &&
         AUTH_CONFIG.GOOGLE_CLIENT_ID.trim().length > 20;
}

function supabaseConfigured() {
  return !!(AUTH_CONFIG.SUPABASE_URL && AUTH_CONFIG.SUPABASE_ANON_KEY);
}
