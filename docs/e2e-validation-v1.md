## Admin E2E Access

- In E2E / staging, Admin authentication is bypassed via `VITE_ADMIN_TEST_MODE=true`.
- A test token (`VITE_ADMIN_TEST_TOKEN`) is auto-injected on app init.
- This allows Playwright to access `/admin` directly and run UI snapshot tests without real login.
- Production behavior is unchanged.
