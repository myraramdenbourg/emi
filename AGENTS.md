# Project Decisions

- Use `rule-text` for orange text and interactive labels; reserve `rule` for decorative lines, borders, fills, and illustrations so contrast can be tuned independently.
- Use semantic status regions for puzzle feedback and a shared keyboard focus outline; this keeps gameplay announcements consistent without speaking the timer every second.
- Derive dashboard reports client-side from `analytics_events`; this preserves the existing admin-only event store without duplicating analytics data.