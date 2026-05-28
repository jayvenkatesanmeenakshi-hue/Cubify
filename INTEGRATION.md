# StarVortex Passport Integration Protocol 🛰️

This is a **mandatory specification** for all ecosystem nodes (GrindOS, ExplainerX, FireInk, Chronos). Deviations from this protocol will cause 404 errors.

## 1. The Neural Handshake (Dedicated Links)

Rather than constructing complex query parameters, other apps SHOULD redirect users to their dedicated Passport node:

| Your App | Redirect Link (Passport Entry) |
| :--- | :--- |
| **GrindOS** | `https://passport.starvortexai.com/grindos-login` |
| **ExplainerX** | `https://passport.starvortexai.com/explainerx-login` |
| **FireInk** | `https://passport.starvortexai.com/fireink-login` |
| **Chronos** | `https://passport.starvortexai.com/chronos-login` |
| **StarVortex** | `https://passport.starvortexai.com/starvortex-login` |

*Note: These dedicated links automatically handle the `client_id` for you.*

---

## 2. Standard Callback Protocol (Mandatory)

All apps in the ecosystem MUST implement the following callback route to receive the handshake data. **Failure to implement this exact route will result in a 404 message on your domain after the user clicks "Authorize".**

**Mandatory Route:** `https://[your-node].starvortexai.com/passport-login-success`

### Handshake Payload (Query Params):
- `passport_id`: The user's internal UID.
- `auth_token`: A base64-validated key for the session.

**Developer Implementation (React Router Example):**
```tsx
<Route path="/passport-login-success" element={<PassportCallbackHandler />} />
```

---

## 3. ZERO-404 Policy 🛡️

To prevent users from hitting 404 errors during redirects or deep-linking:
1. **Your App**: You MUST configure an SPA fallback (catch-all route) that points to `index.html`. 
2. **Passport App**: Support for `/grindos-login`, `/fireink-login`, etc., is already active on the Passport node.
3. **Synchronization**: Once you receive the `passport_id`, synchronize it with your local state to preserve the user's Rank and Aura across the ecosystem.

---

## 4. Message for Other Builder AIs (ChatGPT / Developer Context)

**Copy and paste this message into the context of other builder AIs (GrindOS, ExplainerX, etc.) to ensure a seamless integration:**

> "I am integrating with the **StarVortex Passport** ecosystem (passport.starvortexai.com). 
> 
> My task is to implement the Passport Handshake. Please do the following:
> 1. Create a dedicated route at `/passport-login-success`.
> 2. This route will receive `passport_id` (the user's UID) and `auth_token` as query parameters.
> 3. Store these in our app's global state to maintain the user's cross-platform session.
> 4. CRITICAL: Update our server configuration (e.g., `vercel.json` or `server.ts`) to enable SPA Fallback (catch-all routes) so that navigating back from Passport directly to `/passport-login-success` does not trigger a 404.
> 5. To initiate login, redirect the user to: `https://passport.starvortexai.com/[your-node-name]-login`."

---

## Ecosystem Node Directory

| App Name | Node ID | Role |
| :--- | :--- | :--- |
| **Passport** | `passport` | Neural Identity Hub |
| **GrindOS** | `grindos` | Task Orchestration |
| **ExplainerX** | `explainerx` | Intelligence Node |
| **FireInk** | `fireink` | Creative Workspace |
| **Chronos** | `chronos` | Temporal Analysis |
| **StarVortex** | `starvortex` | Main Portal |
