/**
 * Next.js configuration to expose Supabase URL and anon key to the client
 */
module.exports = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_API_KEY
  }
};