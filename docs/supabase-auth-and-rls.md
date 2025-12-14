# Supabase Auth & RLS Notes

To ensure admin users can create, update and delete data from both web and mobile, you need two things:

1) The admin must be authenticated with Supabase (so requests are made as an authenticated user). In this project, local admin login (username `mos`) now attempts to sign in to Supabase using the same email/password (e.g., `mos@core.com` / `mos07`) and will sign up automatically if needed.

Note: Supabase enforces a minimum password length of 6 characters. The default admin password shipped with the project has been updated to **`mos007`** to comply with this restriction. If you had previously used `mos07`, please use `mos007` when logging in or change the password in the local user store.

2) Your Supabase Row-Level Security (RLS) policies must allow authenticated users to perform actions (or more granular policies depending on your security model).

Example policies (for `membership_packages` table):

- Allow authenticated users to read all rows:

```sql
CREATE POLICY "allow_authenticated_select" ON public.membership_packages
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

- Allow authenticated users to insert/update/delete (less secure — adjust to your needs):

```sql
CREATE POLICY "allow_authenticated_write" ON public.membership_packages
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
```

Notes:
- These example policies are permissive for all authenticated users. If you need stricter control (e.g., only certain admin users or roles can write), you should create policies that check a custom claim (like `app_role`) or compare `auth.email()` with a list of allowed emails.
- If you're using the `anon` (publishable) key only (no Supabase auth session), operations will be executed as the `anon` role and will be subject to policies for `anon`. If `anon` write policies are disabled, writes will fail.

If you prefer a more secure approach for production:
- Create a small server-side API (serverless function) that runs with Supabase `service_role` key and performs writes after validating a server-issued token, or
- Add proper Supabase users for your admins and define narrower RLS policies that check claims (e.g., using JWT custom claims).

If you'd like a ready-to-run example migration, I've added a permissive SQL migration to `supabase/migrations/20251215083000_add_membership_packages_rls.sql` that enables RLS on `membership_packages` and creates permissive policies for authenticated users (for testing). **Do not** use it as-is in production — instead use it to confirm whether RLS is the cause of your 401, then tighten policies appropriately.

Environment variables check:

- Ensure your `.env` / `.env.local` has these variables set for local development:

  - `VITE_SUPABASE_URL` (e.g., https://xyz.supabase.co)
  - `VITE_SUPABASE_PUBLISHABLE_KEY` (the anon/public key)

  You can also use the in-app debug panel (open `/?debug=true`) and click **Test Supabase** to confirm env var presence and run a minimal test query.

Command-line test (PowerShell)

1. Temporarily set env vars and run the included script from the repository root:

```powershell
$env:VITE_SUPABASE_URL = 'https://<your-project>.supabase.co'
$env:VITE_SUPABASE_PUBLISHABLE_KEY = '<your-anon-key>'
node scripts/test-supabase-connection.js
```

2. The script will print the endpoint it tests, the HTTP status, and the response body (or an error). Typical failures:
- 401/403: key is invalid or no session/permissions
- 42501: Row-Level Security policy blocked the action (for writes)

Security note: You posted a publishable key in the chat. If this key was shared publicly, **rotate** it in the Supabase dashboard now and replace `VITE_SUPABASE_PUBLISHABLE_KEY` with the new anon key in your local `.env`.

If you want, I can:
- Add example SQL migration files to this repo for the policies above, and/or
- Add a small serverless function (`/api/write`) example that proxies write requests, validates your local admin token, and performs the write with `service_role` privileges.

Restricted RLS example (recommended)

If you prefer a safer, restrictive policy that **only allows writes from the admin email `mos@core.com`**, use the SQL file `supabase/migrations/20251215100000_membership_packages_restricted_rls.sql`. It:

- Enables RLS on `membership_packages`,
- Adds a `allow_authenticated_select` policy so authenticated users can read,
- Adds a `allow_mos_write` policy that allows INSERT/UPDATE/DELETE only when `auth.email() = 'mos@core.com'`.

Run that migration in the Supabase SQL Editor to test whether admin writes succeed; if they do, you can then modify the policy to include other admin emails or tighter checks as needed.

---

If you try to create a membership package and it still fails, please copy the exact error message shown in browser console (or app toast). I can then update the client to show a clearer error and/or implement a fallback (server proxy).

Quick debug tips:
- Open the app with ?debug=true (e.g., http://localhost:5173/?debug=true) to show the **Auth Debug** panel which displays the current Supabase session and allows a refresh/log action.
- After attempting a failing save, check the browser console and the Auth Debug panel for `Supabase session` information and the exact error returned by Supabase (often includes `status: 401` and message details).
