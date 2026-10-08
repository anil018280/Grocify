# Meeting – Team-Only

**File Name:** 2026-04-13-team-meeting.md
**Meeting Type:** Team-Only
**Date:** 2026-04-13
**Start–End Time:** 7:00 PM – 9:00 PM
**Location/Mode:** Zoom

**Attendees:**
- Anil Kumar Bandaru
- Harsha Vardhan Badithaboina
- Arathi Boddam
- Sanjushree Golla

---

## 1) Accomplished Since Last Meeting
- All 5 usability sessions conducted and raw notes compiled.
- Recipe card layout and detail page live and styled.
- UI tokens standardized; button and color inconsistencies resolved.
- Usability test materials (task scripts, SUS forms) archived in `/docs` folder on GitHub.

## 2) Accomplished During This Meeting
- Reviewed usability session findings:
  - Average SUS score: 71/100.
  - Pain point 1: Recipe suggestion button label not intuitive — users did not know to click it after updating pantry.
  - Pain point 2: Budget price input via modal felt slow; users expected inline editing.
  - Positive feedback: Pantry management intuitive; recipe cards visually clear and easy to scan.
- Agreed on two targeted fixes before advisor meeting (Apr 14): tooltip on suggestion trigger, inline budget price edit.
- Ran full integration test end-to-end: login → pantry CRUD → recipe suggestions → budget — no critical errors; one minor latency issue on large pantry lists (4+ seconds).
- Discussed YOLOv8 vision prototype: Sanjushree tested offline detection on 5 grocery images using default YOLOv8n weights; detected 4 out of 5 items correctly.
- Agreed to include vision as a proof-of-concept section in Workbook 2, not a fully integrated feature.
- Divided Workbook 2 writing assignments:
  - System Design: Anil + Arathi
  - Implementation: Harsha + Sanjushree
  - Evaluation: Harsha + Arathi
  - Future Work: Anil

## 3) Issues / Blockers
- Large pantry list (10+ items) causes ~4-second RAG suggestion delay; needs optimization.
- Vision detection tested offline only; not connected to any API endpoint.
- Workbook 2 writing has not started yet.

## 4) Action Items
- Add tooltip and clarify recipe suggestion label in UI | Owner: Sanjushree | Due: 2026-04-14 (before advisor meeting)
- Limit RAG suggestion input to top 5 pantry items to reduce latency | Owner: Harsha | Due: 2026-04-17
- Redesign budget price input as inline edit | Owner: Anil | Due: 2026-04-17
- Start System Design section for Workbook 2 | Owner: Anil + Arathi | Due: 2026-04-19

## 5) Plans / Goals for Next Meeting
- Usability fixes live.
- Latency issue resolved.
- System Design section first draft complete.
