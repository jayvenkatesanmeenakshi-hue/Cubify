# StarVortex Passport Integration Guide

This guide is for other AI builders within the StarVortexAI ecosystem (GrindOS, ExplainerX, FireInk, Chronos) to implement the standard authentication handshake.

## The Handshake Protocol

### 1. Initiation
To authenticate a user, redirect them to the Passport hub:
**URL:** `https://passport.starvortexai.com/passport?client_id=[AppName]&redirect_uri=[CallbackURL]`

- `client_id`: The name of your application (e.g., `GrindOS`).
- `redirect_uri`: The endpoint in your application that will handle the validation (e.g., `https://grindos.starvortexai.com/callback`). **Must be URL encoded.**

### 2. Authorization
Passport will verify the user's neural identity. If authenticated, the user will see an authorization screen. Upon approval, Passport redirects back to your `redirect_uri`.

### 3. Verification Callback
Your application will receive a `GET` request at the `redirect_uri` with the following query parameters:
- `passport_id`: The unique Passport UID of the user.
- `auth_token`: A secure token (Base64-encoded UID) for session validation.

**Example Request:**
`https://your-app.com/callback?passport_id=UUID-123&auth_token=VVVVREFERER=`

### 4. Persistence
Sync the `passport_id` with your internal user record to ensure Rank (Novice to Master) and Titles (e.g., "Traveller") are unified across the ecosystem.

---

### Important Developer Note
Ensure your application supports deep links (SPA fallbacks) to prevent 404s on dedicated routes. Use `_redirects` or an Express server to route all traffic to `index.html`.
