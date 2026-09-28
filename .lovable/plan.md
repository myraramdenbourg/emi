# Restyle and secure admin sign-in

## Changes
- Restyle `/auth` as a focused Market Log paper page using the existing cream, ink, and burnt-orange design tokens.
- Keep email and password sign-in only; remove the public account-creation toggle and signup code.
- Disable new account registration in Lovable Cloud so signup is blocked beyond the visible page too.
- Preserve the existing redirect for signed-in users and send successful admin sign-ins to the analytics dashboard.
- Show clear, accessible sign-in errors without exposing account information.

## Account check
- Identify which existing accounts currently hold the admin role and report their email addresses.
- Do not expose passwords: stored passwords are one-way protected and cannot be read. Existing admins can use password recovery if access is lost.

## Verification
- Check the page on phone and desktop sizes.
- Confirm no signup control remains, sign-in form semantics and focus are accessible, and the current build is healthy.
