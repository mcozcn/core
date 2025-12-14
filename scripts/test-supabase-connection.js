// Simple script to test Supabase REST access for membership_packages
// Usage (PowerShell):
// $env:VITE_SUPABASE_URL = 'https://<project>.supabase.co'; $env:VITE_SUPABASE_PUBLISHABLE_KEY = '<anon-key>'; node scripts/test-supabase-connection.js

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('Missing environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  process.exit(2);
}

(async () => {
  try {
    const endpoint = `${url.replace(/\/$/, '')}/rest/v1/membership_packages?select=id&limit=1`;
    console.log('Testing Supabase endpoint:', endpoint);

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json'
      }
    });

    console.log('Status:', res.status);
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      console.log('Body (parsed JSON):', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Body (raw):', text);
    }

    if (res.status >= 400) {
      console.error('Request failed. This likely indicates a missing/invalid key, no session, or RLS policy blocking access (e.g., 401/403 or 42501 on insert).');
      process.exit(1);
    }

    console.log('Supabase basic select succeeded.');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
})();
