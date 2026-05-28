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

All apps in the ecosystem MUST implement the following callback route to receive the handshake data:

**Route:** `/[your-app-domain].starvortexai.com/passport-login-success`

### Handshake Payload (Query Params):
- `passport_id`: The user's internal UID.
- `auth_token`: A base64-validated key for the session.

**Example Received URL:**
`https://grindos.starvortexai.com/passport-login-success?passport_id=UUID-123&auth_token=VVVVREFERER=`

---

## 3. Deployment Checklist for Builders 🛡️

1. **SPA Fallback**: Ensure your app (GrindOS, etc.) routes all traffic to `index.html`. 404s on `/passport-login-success` are usually caused by missing SPA routing config.
2. **Path Definition**: Define `/passport-login-success` in your React/Vue/Svelte router.
3. **Session Persistence**: Once you receive the `passport_id`, synchronize it with your local state to preserve the user's Rank (Novice to Master) and Aura values across nodes.

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
