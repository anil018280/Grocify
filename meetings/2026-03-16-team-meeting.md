# Meeting – Team-Only

**File Name:** 2026-03-16-team-meeting.md
**Meeting Type:** Team-Only
**Date:** 2026-03-16
**Start–End Time:** 7:00 PM – 8:30 PM
**Location/Mode:** Zoom

**Attendees:**
- Anil Kumar Bandaru
- Harsha Vardhan Badithaboina
- Arathi Boddam
- Sanjushree Golla

---

## 1) Accomplished Since Last Meeting
- Pantry CRUD fully working and tested.
- RAG ingredient-match filter implemented; informal tests show improved relevance.
- Recipe dataset at 100 entries with full nutritional fields.
- API README documentation complete.

## 2) Accomplished During This Meeting
- Reviewed advisor feedback from Mar 3 meeting: confirmed evaluation set and frontend scaffolding are next priorities.
- Planned 20-query RAG evaluation set: defined 4 query categories (2–3 pantry items, 4–5 items, dietary filter queries, edge cases with uncommon ingredients).
- Discussed JWT auth flow: register → login → access token → protected route middleware.
- Discussed React app structure: pages (Pantry, Recipes, Budget, Login), shared component library, Axios for API calls.
- Reviewed budget spec outline: `/budget` endpoints for setting budget, retrieving summary, flagging overspend by category.
- Agreed to use rule-based budget engine for MVP (no ML needed at this stage).

## 3) Issues / Blockers
- Ground-truth labels for evaluation set need careful manual curation; time-intensive.
- React project not yet initialized.
- Budget data model needs sign-off before implementation begins.

## 4) Action Items
- Manually label ground-truth recipes for 20-query evaluation set | Owner: Harsha | Due: 2026-03-20
- Initialize React project and implement static pantry list view | Owner: Sanjushree | Due: 2026-03-20
- Implement JWT register and login endpoints | Owner: Anil | Due: 2026-03-20
- Finalize budget data model (Budget, PriceEntry tables) | Owner: Arathi | Due: 2026-03-20

## 5) Plans / Goals for Next Meeting
- Show advisor completed RAG evaluation baseline and React scaffolding.
- Review auth and budget spec before implementation.
