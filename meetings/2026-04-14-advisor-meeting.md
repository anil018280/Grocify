# Meeting – Advisor Meeting

**File Name:** 2026-04-14-advisor-meeting.md
**Meeting Type:** Advisor
**Date:** 2026-04-14
**Start–End Time:** 1:30 PM – 2:00 PM
**Location/Mode:** In-person

**Attendees:**
- Prof. Andrew Bond
- Anil Kumar Bandaru
- Harsha Vardhan Badithaboina
- Arathi Boddam
- Sanjushree Golla

---

## 1) Accomplished Since Last Meeting
- Full pantry CRUD functional in React frontend connected to FastAPI + PostgreSQL.
- Budget summary page live with category breakdown and overspend alerts.
- Recipe recommendations redesigned as card layout with dietary tag badges.
- Recipe detail page built (ingredients, steps, dietary tags).
- UI button styles and color tokens standardized across all pages.
- Usability sessions conducted with 5 participants.

## 2) Accomplished During This Meeting
- Full end-to-end live demo: login → pantry management → recipe recommendations (card view) → recipe detail → budget summary.
- Advisor positive about integration quality; noted this is the most complete demo seen so far.
- Presented usability findings: average SUS score 71/100 (acceptable range); top pain points — unclear how to trigger recipe suggestions, budget price entry confusing.
- Advisor approved SUS as a valid usability metric; suggested also noting qualitative observations in the report.
- Discussed RAG metrics: precision@3 = 0.75, recall@3 = 0.72, F1@3 = 0.735; advisor satisfied with results as a Phase 1 baseline.
- Advisor outlined Workbook 2 required sections: System Design, Implementation, Evaluation, Future Work.
- Confirmed vision module can be included as a proof-of-concept section if time permits; not required for Workbook 2.

## 3) Issues / Blockers
- Recipe suggestion trigger button label unclear to users (identified in usability sessions).
- Budget price input UX needs simplification.
- Workbook 2 report not yet started.

## 4) Action Items
- Add tooltip and clearer label to recipe suggestion trigger | Owner: Sanjushree | Due: 2026-04-19
- Redesign budget price input to inline edit (remove modal) | Owner: Anil | Due: 2026-04-19
- Write usability findings summary for Workbook 2 Evaluation section | Owner: Arathi | Due: 2026-04-19
- Begin Workbook 2 System Design section outline | Owner: Anil + Arathi | Due: 2026-04-19

## 5) Plans / Goals for Next Meeting
- Usability fixes deployed.
- Workbook 2 System Design section drafted.
- Assess feasibility of YOLOv8 vision proof-of-concept.
