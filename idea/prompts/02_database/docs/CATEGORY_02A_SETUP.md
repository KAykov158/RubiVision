# Category 02A local setup

1. Install the pinned Supabase CLI from the repository root with `npm ci`.
2. Start the local stack with `npm run db:start`, then apply migrations with `npm run db:reset`.
3. Copy `apps/web/.env.example` to `apps/web/.env.local` and use the local API URL and publishable/anon key printed by `supabase start`. Browser code must only use this public key.
4. Run the web app from `apps/web` with `npm run dev`. Configure Auth email confirmation and password reset redirect URLs for the local app URL (normally `http://localhost:5173/auth/sign-in` and `http://localhost:5173/auth/reset-password`).
5. Use two distinct local accounts to verify account separation. Never point local migration or reset commands at a hosted project.

The `recordings` Storage bucket is private. The existing hosted bucket was confirmed at 104,857,600 bytes (100 MiB), while the project is staying on the Supabase Free plan. The additive forward migration `20261018000200_recordings_50mib_limit.sql` lowers the per-object cap to 52,428,800 bytes (50 MiB) without rewriting applied migration history; it has not been applied to hosted Supabase. A local `db:reset` applies the complete local migration history and results in the 50 MiB cap. Recording uploads are not enabled in the current UI; when an explicit upload flow is added, validate file size with `validateRecordingUploadSize` before upload and rely on Storage to enforce the limit server-side. Do not upload objects over the cap.

Cloud persistence needs a connection and an authenticated account. The timer page stays available without authentication, while account data routes require a restored Supabase session when cloud configuration is present. A save that has not received a successful server response is not saved; volatile unsaved solves can be lost when the page closes or reloads.
