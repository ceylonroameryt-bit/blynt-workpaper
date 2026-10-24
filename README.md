# Blynt Workpapers

## Sign-in and access

- Sign in at `/login`. Sessions are HttpOnly cookies signed with `AUTH_SECRET`.
- **Production:** set `AUTH_SECRET` to a random string of at least 32 characters. The app refuses to start sessions without it.
- Test users: `preparer@test.local`, `reviewer@test.local`, `partner@test.local`, `admin@test.local`. Their password comes from `TEST_USER_PASSWORD`, or `Blynt-Test-2026!` if that is not set. Change it before real client data goes in.
- The browser only receives its own firm's data. Every save is checked on the server: sign-off levels by role, no approving your own adjustment, lock and unlock by partner or admin only, an append-only audit log, and no edits inside a locked engagement.
- Multi-factor sign-in is not built yet. Accounts with MFA switched on cannot sign in.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
