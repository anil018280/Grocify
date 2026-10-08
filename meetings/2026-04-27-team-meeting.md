# Meeting – Team-Only

**File Name:** 2026-04-27-team-meeting.md
**Meeting Type:** Team-Only
**Date:** 2026-04-27
**Start–End Time:** 6:30 PM – 9:00 PM
**Location/Mode:** Zoom

**Attendees:**
- Anil Kumar Bandaru
- Harsha Vardhan Badithaboina
- Arathi Boddam
- Sanjushree Golla

---

## 1) Accomplished Since Last Meeting
- Implementation section complete: FastAPI backend, React frontend, and RAG pipeline all documented.
- Evaluation section complete: RAG metrics table (precision@3 = 0.75, recall@3 = 0.72, F1@3 = 0.735), SUS scores, and qualitative usability observations included.
- Future Work section complete: three next-phase items documented (real-time pricing API, full YOLOv8 integration, mobile PWA).
- Embedding pipeline diagram added to System Design section.

## 2) Accomplished During This Meeting
- Full internal review of Workbook 2 draft as a team; all sections reviewed.
- Gaps identified and resolved during meeting:
  - Introduction motivation paragraph was too brief; expanded with food waste and household budget statistics.
  - Implementation section was missing ER diagram reference; caption and figure number added.
  - Evaluation section qualitative observations were vague; made more specific with direct quotes from usability sessions.
- Fixed one remaining bug found during final review: budget overspend flag not triggering correctly when item price is manually edited inline; resolved with state update fix in React.
- Ran full integration test: login → pantry CRUD → recipe suggestions → budget summary — all passing, no errors.
- Prep for Apr 28 advisor meeting: agreed demo sequence, assigned speaking roles.

## 3) Issues / Blockers
- Presentation slide deck not yet started; needed before final submission.
- No screenshots of actual UI in report yet; figures show placeholder references.

## 4) Action Items
- Add actual UI screenshots to report figures | Owner: Sanjushree | Due: 2026-04-29
- Begin presentation slide deck | Owner: Sanjushree | Due: 2026-04-30
- Final proofread for grammar and terminology consistency | Owner: Entire Team | Due: 2026-05-01
- Tag current codebase as `v1.0-workbook2` in GitHub | Owner: Anil | Due: 2026-04-30

## 5) Plans / Goals for Next Meeting
- Workbook 2 polished and submitted after advisor sign-off.
- Presentation slides in progress.
- CMPE 295B Phase 3 plan drafted.
