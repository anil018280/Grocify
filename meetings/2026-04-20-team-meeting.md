# Meeting – Team-Only

**File Name:** 2026-04-20-team-meeting.md
**Meeting Type:** Team-Only
**Date:** 2026-04-20
**Start–End Time:** 6:30 PM – 8:30 PM
**Location/Mode:** Zoom

**Attendees:**
- Anil Kumar Bandaru
- Harsha Vardhan Badithaboina
- Arathi Boddam
- Sanjushree Golla

---

## 1) Accomplished Since Last Meeting
- Recipe suggestion tooltip added; "Get Recipes" button label updated for clarity.
- RAG suggestion latency reduced from ~4s to ~1.5s by limiting input to top 5 pantry items by recency.
- Budget price input redesigned to inline edit; modal removed.
- System Design section first draft completed.

## 2) Accomplished During This Meeting
- Reviewed updated UI with usability fixes; agreed both changes clearly address session pain points.
- Reviewed System Design draft: architecture diagram present; AI layer description flagged as too high-level — needs embedding pipeline diagram and component details.
- Assigned remaining Workbook 2 writing sections with internal deadline of Apr 27:
  - Implementation section: Harsha + Sanjushree (backend, frontend, RAG pipeline).
  - Evaluation section: Harsha + Arathi (RAG metrics table, SUS results, qualitative observations).
  - Future Work section: Anil (real-time pricing API, mobile PWA, full vision integration).
- Reviewed YOLOv8 vision prototype: ran detection on 10 grocery images; 8/10 detected correctly with default weights.
- Decided vision proof-of-concept section will include: motivation, model choice rationale, offline demo results, and integration plan for next semester.
- Set internal Workbook 2 complete draft deadline: April 27.

## 3) Issues / Blockers
- AI layer description in System Design still too abstract; needs diagram.
- Implementation section not yet started.
- Vision detection only tested locally; no API wrapper built.

## 4) Action Items
- Add embedding pipeline diagram to System Design AI layer section | Owner: Harsha | Due: 2026-04-24
- Write Implementation section (FastAPI backend, React frontend, RAG pipeline) | Owner: Harsha + Sanjushree | Due: 2026-04-26
- Write Evaluation section (RAG precision/recall/F1 table, SUS scores, qualitative findings) | Owner: Arathi | Due: 2026-04-26
- Write Future Work section with 3 concrete next-phase items | Owner: Anil | Due: 2026-04-26

## 5) Plans / Goals for Next Meeting
- Full Workbook 2 draft assembled and reviewed internally.
- Prepare for Apr 28 advisor final review meeting.
- Begin presentation slide deck.
