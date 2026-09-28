# Restyle and expand the analytics dashboard

## What will change
- Restyle `/dashboard` as a cream Market Log page using the same paper texture, navy ink, burnt-orange rules, typography, controls, and compact mobile behavior as the player pages.
- Keep the existing admin-only access, date filter, puzzle filter, journey funnel, hint metrics, and answer correctness reporting.
- Add average completed-game time for the selected date range, based on a completion event carrying the final elapsed time.
- Add a per-puzzle list of the most common incorrect submitted answers, with counts.
- Add an after-journey engagement section counting share-card clicks, share-the-game clicks, Instagram clicks, and Behind the Scenes/Credits clicks.
- Add any missing click events so future dashboard activity is counted consistently.

## Data and privacy
- Continue using the existing anonymous session-based analytics records; no new player account data will be collected.
- Preserve submitted wrong-answer text because it is required for the requested “common incorrect answers” report.
- Display the verified retention status in the dashboard: analytics records currently have no automatic deletion policy and are retained indefinitely unless manually deleted.

## Verification
- Check the dashboard with seeded/sample analytics data at desktop and phone widths.
- Confirm admin gating still works, filters update all new metrics, click events are emitted, and the project builds cleanly.

## Technical details
- Use the current `analytics_events` table and existing event payload field; no database schema change is needed.
- Record completion duration in milliseconds on the journey-finished event and aggregate only valid completed sessions.
- Normalize wrong answers for grouping while displaying a readable submitted form; exclude correct submissions and blanks.
