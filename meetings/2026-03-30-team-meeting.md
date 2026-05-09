# Meeting – Team-Only

**File Name:** 2026-03-30-team-meeting.md
**Meeting Type:** Team-Only
**Date:** 2026-03-30
**Start–End Time:** 7:00 PM – 8:30 PM
**Location/Mode:** Zoom

**Attendees:**
- Anil Kumar Bandaru
- Harsha Vardhan Badithaboina
- Arathi Boddam
- Sanjushree Golla

---

## 1) Accomplished Since Last Meeting
- Ingredient name normalization added to RAG preprocessing pipeline.
- React pantry list confirmed live with backend; add/edit/delete forms in progress.
- Budget POST and GET endpoints tested and working.
- Recipe dataset expanded to 125 entries with dietary tags (vegetarian, vegan, gluten-free).

## 2) Accomplished During This Meeting
- Re-ran RAG evaluation after normalization: precision@3 = 0.75, recall@3 = 0.72, F1@3 = 0.735.
- Discussed improvement: uncommon ingredient names now correctly mapped (e.g., "capsicum" → "bell pepper").
- Reviewed pantry Add/Edit/Delete form progress; Add form functional, Edit and Delete still in progress.
- Reviewed budget summary page wireframe; agreed on layout: category bar chart + overspend alert banners.
- Drafted usability test plan: 5 participants, 4 tasks (add pantry item, get recipe suggestions, view budget, edit pantry item), SUS questionnaire.
- Prep session for Mar 31 advisor meeting: assigned speaking roles and demo sequence.

## 3) Issues / Blockers
- Pantry Edit and Delete forms not yet complete.
- Budget frontend page not yet built (backend only).
- Usability sessions not yet scheduled; need to recruit participants.

## 4) Action Items
- Complete pantry Edit and Delete forms in React | Owner: Sanjushree | Due: 2026-04-04
- Build budget summary frontend page (category bars + overspend flags) | Owner: Anil | Due: 2026-04-05
- Recruit 5 usability test participants and schedule sessions for week of Apr 13 | Owner: Arathi | Due: 2026-04-05
- Write up RAG evaluation results in a shareable doc for Workbook 2 reference | Owner: Harsha | Due: 2026-04-05

## 5) Plans / Goals for Next Meeting
- Full pantry CRUD in frontend complete.
- Budget page live.
- Participants confirmed for usability testing.
