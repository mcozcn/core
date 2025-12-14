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

If you want, I can:
- Add example SQL migration files to this repo for the policies above, and/or
- Add a small serverless function (`/api/write`) example that proxies write requests, validates your local admin token, and performs the write with `service_role` privileges.

---

If you try to create a membership package and it still fails, please copy the exact error message shown in browser console (or app toast). I can then update the client to show a clearer error and/or implement a fallback (server proxy).

Quick debug tips:
- Open the app with ?debug=true (e.g., http://localhost:5173/?debug=true) to show the **Auth Debug** panel which displays the current Supabase session and allows a refresh/log action.
- After attempting a failing save, check the browser console and the Auth Debug panel for `Supabase session` information and the exact error returned by Supabase (often includes `status: 401` and message details).
