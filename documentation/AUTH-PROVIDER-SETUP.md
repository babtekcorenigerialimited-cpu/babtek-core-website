# BABTEK Authentication Provider Setup

## Email and password recovery
The application includes:
- Email/password login for founder, clients and partners.
- Password recovery request at `/auth/forgot-password`.
- Password update at `/auth/reset-password`.
- Supabase auth callback at `/auth/callback`.

In Supabase Dashboard → Authentication → URL Configuration:
1. Set the Site URL to the canonical BABTEK website URL after the domain is selected.
2. Add the exact Vercel preview URL(s) used for testing to Redirect URLs.
3. Add `http://localhost:3000/auth/callback` for local development.
4. Keep production and preview redirect URLs narrowly scoped; do not use a wildcard for arbitrary hosts.

## Google OAuth
The website includes a Google sign-in button, but Google sign-in will not work until the provider is configured:
1. In Google Cloud Console, create an OAuth 2.0 Web application client.
2. Add the Supabase Auth callback URL shown in Supabase Dashboard → Authentication → Providers → Google (typically `https://<project-ref>.supabase.co/auth/v1/callback`) as an authorised redirect URI in Google Cloud.
3. Copy the Google client ID and client secret into the Supabase Google provider settings. Do not put the client secret in the website repository, chat, or any `NEXT_PUBLIC_*` environment variable.
4. Enable the Google provider in Supabase.
5. Add the BABTEK website and preview callback URLs to Supabase Redirect URLs.
6. Test sign-in with a controlled client account, partner account and the founder account. Verify role assignment and record linking before external rollout.

The OAuth button uses Supabase's hosted OAuth flow. Google identity alone does not grant founder privileges. Founder access continues to require the pre-assigned owner role. New partner accounts must still be linked to a partner record by BABTEK.

## Security notes
- Never promote an OAuth-created account to owner automatically.
- Keep the owner role founder-controlled.
- Verify email confirmation, redirect allowlists, role mapping, RLS and account recovery end-to-end.
- Use separate OAuth client credentials for production and preview where practical.
