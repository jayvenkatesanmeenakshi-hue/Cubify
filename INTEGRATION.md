# StarVortex Passport Integration Protocol 🛰️

This is a **mandatory specification** for all AI builders (GrindOS, Chronos, etc.) within the StarVortexAI ecosystem. 

## 1. The Neural Handshake (Auth Flow)

To authenticate a user, your application MUST redirect them to the Passport Identity Node.

**Endpoint:** `https://passport.starvortexai.com/passport`

### Required Query Parameters:
- `client_id`: **CRITICAL**. Use the simple node name (e.g., `grindos`, `explainerx`, `fireink`, `chronos`). If you are the main portal, use `starvortex`. 
- `redirect_uri`: The full callback URL in your app (e.g., `https://grindos.starvortexai.com/callback`). **MUST be URL-encoded.**

**Correct Example Path:**
`/passport?client_id=grindos&redirect_uri=https%3A%2F%2Fgrindos.starvortexai.com%2Fcallback`

---

## 2. Handling the Callback

Passport will redirect the user back to your `redirect_uri` with these parameters:
- `passport_id`: The user's internal UID.
- `auth_token`: A base64-validated neural key for this session.

**You must store these in your local state/context to maintain the user's Rank and Title.**

---

## 3. ZERO-404 Policy 🛡️

To prevent users from hitting 404 errors during redirects or deep-linking:
1. **SPA Fallback**: Use a `_redirects` file (for static hosting) or a catch-all route (for Express/Node) that points everything back to `index.html`.
2. **Path Consistency**: Ensure your callback route (e.g., `/callback`) is defined in your React Router configuration.

---

## 4. Ecosystem Node Directory

| App Name | Client ID (Handshake) | Role |
| :--- | :--- | :--- |
| **Passport** | `passport` | Neural Identity Hub |
| **GrindOS** | `grindos` | Task Orchestration |
| **ExplainerX** | `explainerx` | Intelligence Node |
| **FireInk** | `fireink` | Creative Workspace |
| **Chronos** | `chronos` | Temporal Analysis |
| **StarVortex** | `starvortex` | Main Ecosystem Entry |
