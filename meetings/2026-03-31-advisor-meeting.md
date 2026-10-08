# Meeting – Advisor Meeting

**File Name:** 2026-03-31-advisor-meeting.md
**Meeting Type:** Advisor
**Date:** 2026-03-31
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
- RAG evaluation baseline: precision@3 = 0.70, recall@3 = 0.65.
- Ingredient name normalization implemented; re-evaluation in progress.
- React frontend connected to live FastAPI GET /pantry endpoint.
- JWT authentication fully working end-to-end (register, login, protected routes).
- Budget POST and GET endpoints implemented.

## 2) Accomplished During This Meeting
- Demoed live React pantry view pulling real data from PostgreSQL.
- Showed RAG evaluation results; advisor noted recall gap and confirmed normalization is the right fix.
- Advisor recommended also computing F1 score for a single summary metric in the final report.
- Budget endpoint demo: POST /budget with category limits and GET /budget returning overspend flags; advisor approved rule-based approach.
- Advisor recommended recruiting 3–5 peers for usability testing before Workbook 2 submission.
- Discussed Workbook 2 timeline: advisor expects integrated system (login → pantry → recipes → budget) visible by the next advisor check-in.
- Advisor reminded team to document trade-off decisions (e.g., Chroma vs Pinecone, OpenAI vs open-source LLM) in the report.

## 3) Issues / Blockers
- F1 score not yet computed for RAG evaluation.
- No usability test plan drafted yet.
- Pantry Add/Edit/Delete forms not yet built in React (only GET connected).

## 4) Action Items
- Re-run RAG evaluation post-normalization and compute F1@3 | Owner: Harsha | Due: 2026-04-07
- Build pantry Add/Edit/Delete forms in React | Owner: Sanjushree | Due: 2026-04-07
- Draft usability test plan (tasks, participants, SUS questionnaire) | Owner: Arathi | Due: 2026-04-07
- Implement budget summary frontend page | Owner: Anil | Due: 2026-04-07

## 5) Plans / Goals for Next Meeting
- Full pantry CRUD working in frontend.
- Updated RAG metrics (precision, recall, F1) documented.
- Usability test plan ready for advisor review.
