# RVS Onboarding Web App

This is a Next.js web application implementing a user onboarding flow with Supabase authentication and PostgreSQL database.

Features:
- Three-step user onboarding wizard customizable via admin UI
- Supabase email/password authentication
- PostgreSQL tables for user profiles and admin page configurations
- Public data table view at `/data`

Setup:
1. Copy the provided `.env` file or set the following environment variables:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_API_KEY`: Your Supabase anon public API key
   - `SUPABASE_POSTGRES_PASSWORD`: Your database password (used for migrations)
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the database:
   Run the SQL script in `supabase/init.sql` against your Supabase database (e.g., via Supabase SQL Editor or CLI).
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Access the app at `http://localhost:3000`.

Routes:
- `/`: Main onboarding wizard
- `/admin`: Admin UI to configure wizard components
- `/data`: Public data table of user-submitted profiles

Ensure your Supabase project has email confirmation disabled or handle email confirmations appropriately for seamless signup.