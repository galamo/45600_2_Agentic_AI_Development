---
name: utc-dates
description: Enforces UTC timezone and ISO-8601 formatting for any date or time shown to the user. Use whenever the agent needs to display, report, or write out a date/timestamp (commit times, deploy timestamps, file mtimes, "today's date", scheduling, logs, reports).
---

# UTC Dates

Whenever a date or time is shown to the user (in chat text, commit messages, reports,
artifacts, filenames, or generated code output meant for display), it must be:

- Converted to **UTC** (never local time, never an unspecified/ambiguous timezone).
- Formatted as **ISO-8601**: `YYYY-MM-DDTHH:mm:ssZ` (e.g. `2026-08-27T14:05:00Z`) for
  a full timestamp, or `YYYY-MM-DD` for a date-only value.
- Suffixed with `Z` (not `+00:00`) to mark UTC explicitly.

## How to apply

- If a date/time comes from a tool result, file metadata, or system context in another
  timezone or format, convert it to UTC/ISO-8601 before presenting it — don't pass it
  through unchanged.
- If you need the current date/time, get it in UTC rather than assuming local time.
- This applies to prose, tables, logs, and generated file content alike — anywhere a
  human-readable date appears in your output.
- Internal/non-displayed identifiers (e.g. a git short SHA used as a tag) are unaffected —
  this rule is about dates and times specifically, not all identifiers.
