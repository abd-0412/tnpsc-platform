# DECISIONS.md — Decisions and Assumptions Register

**Project:** TNPSC Practice Platform  
**Specification:** Complete Build Specification v2.0 (25 Oct 2026)  
**Status:** Phase P0 (Foundation) Active  

---

## 1. Stack & Pinned Versions (Phase P0)

| Tool / Library | Version | Decision & Rationale |
|---|---|---|
| **Node.js** | `v24.11.0` | Active LTS / current runtime |
| **Next.js** | `16.4.3` | App Router with React 19 and Turbopack |
| **React & React DOM** | `19.3.0` | Latest compatible with Next.js 16 |
| **TypeScript** | `^5` | Strict mode enabled (`"strict": true` in `tsconfig.json`) |
| **Tailwind CSS** | `^4` | Design tokens configured via CSS theme variables |
| **Vitest** | `^3.0.5` | Fast pure domain test runner with alias resolution |
| **Zod** | `^3.24.2` | Single source of truth for validation across UI, importer & DB |
| **Database** | Supabase (PostgreSQL 15+) | Free tier, Row Level Security (RLS) enabled on all tables |

---

## 2. Accounts & Ownership (Section 4)

- **Owner:** Abdul (Abd Azee) — Full admin access on GitHub, Vercel, and Supabase.
- **Second Learner:** Owner's sister — Full learner access.
- **Builder:** Friend working with AI pair programming.
- **Access Rule:** Exactly 2 users. Sign-ups disabled in Supabase Auth. All database tables protected by `is_allowed()` check against `allowed_users` table.
- **Sister's Privacy Agreement:** The sister has been informed that database-level read access is technically accessible to the Supabase project owner (friend/admin), and she has agreed to this setup. In-app privacy between the two users is strictly enforced via RLS.
- **Credentials:** Account credentials and backup encryption keys are to be stored in a shared password manager accessible by both the owner and the builder.

---

## 3. Scheduled Jobs & Reminders (Section 14 & 15)

- **Database Backup:** GitHub Actions scheduled workflow runs weekly (every Sunday at 02:00 IST), performing a read-only pg_dump, encrypting the dump, and archiving.
- **Supabase Keep-Alive:** The same weekly GitHub Actions job executes a lightweight query to ensure the free Supabase project does not pause due to inactivity.
- **Daily Reminders:** Web Push with VAPID keys for supported devices, with an automatic in-app banner fallback when push permissions are denied or unsupported.

---

## 4. Platform Limits & Sizing (Section 6.9 & 17)

- **Attempt Cap:** Maximum 200 questions per attempt.
- **Text Length Limits:** Stem text and explanation maximum 1,500 characters per language; options maximum 300 characters per language.
- **Images:** Uploads compressed to max 1200px width, max 300KB file size, stored in Supabase private bucket with signed URLs.
- **Inactive Time Threshold:** Active study time cuts off after 120 seconds of no user interaction.
- **Due Queue Session:** Capped at 30 items per review session.

---

## 5. Exam Verification Status (Section 5.2 & 23)

- **Group 4 (`g4`)**: Code 496, dated 12.12.2024. Status is `needs_checking` until official notification is verified by the owner. Displays `"unverified"` badge on marks.
- **Group 2/2A Prelims (`g2-prelims`)**: Code 495, dated 12.12.2024. Status is `needs_checking` until verified. Displays `"unverified"` badge on marks.
- **Options**: Default 4 options (A, B, C, D). If official notification confirms "(E) Answer not known" is printed, `showNotKnownOption` will be toggled to true.

---

## 6. Typography & UI Design Tokens (Section 11.2)

- **Font Family:** `Noto Sans`, `Noto Sans Tamil`, and system sans fallbacks.
- **Base Font Size:** Minimum 16px body, line height at least 1.6.
- **Touch Targets:** Minimum 44px touch targets; answer options minimum 48px height.
- **Contrast Ratio:** At least 4.5:1 (WCAG AA) in both Light and Dark themes.
- **Status Indicators:** Every state uses both color and distinct icons (meaning is never communicated by color alone).
