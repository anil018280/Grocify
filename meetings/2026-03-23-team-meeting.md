# Meeting – Team-Only

**File Name:** 2026-03-23-team-meeting.md
**Meeting Type:** Team-Only
**Date:** 2026-03-23
**Start–End Time:** 6:30 PM – 8:00 PM
**Location/Mode:** Zoom

**Attendees:**
- Anil Kumar Bandaru
- Harsha Vardhan Badithaboina
- Arathi Boddam
- Sanjushree Golla

---

## 1) Accomplished Since Last Meeting
- 20-query RAG evaluation set manually labeled with ground-truth recipes.
- React project initialized with React Router v6; Pantry list page rendering static mock data.
- JWT register and login endpoints implemented and tested via Postman.
- Budget data model finalized: `Budget` and `PriceEntry` tables added to schema.

## 2) Accomplished During This Meeting
- Ran RAG evaluation baseline: precision@3 = 0.70, recall@3 = 0.65 on 20-query set.
- Discussed recall gap: recipes with correct ingredients ranked below top-3 due to embedding distance issues on uncommon ingredient name variants (e.g., "capsicum" vs "bell pepper").
- Agreed to add ingredient name normalization as a preprocessing step.
- Reviewed React pantry list view; discussed connecting it to live FastAPI GET /pantry endpoint.
- Reviewed JWT auth flow end-to-end; token validation middleware confirmed working on protected routes.
- Prepared demo content for advisor meeting on Mar 17 (note: prepped one day ahead).

## 3) Issues / Blockers
- Ingredient name normalization not yet implemented.
- React frontend not yet connected to live API (still using mock data).
- Budget POST endpoint not yet built.

## 4) Action Items
- Implement ingredient name normalization in RAG preprocessing | Owner: Harsha | Due: 2026-03-28
- Connect React pantry list to live GET /pantry endpoint via Axios | Owner: Sanjushree | Due: 2026-03-28
- Implement /budget POST and GET summary endpoints | Owner: Anil | Due: 2026-03-28
- Expand recipe dataset to 130 entries and add dietary tags | Owner: Arathi | Due: 2026-03-28

## 5) Plans / Goals for Next Meeting
- Show live pantry view pulling from backend.
- Re-run RAG evaluation after normalization.
- Review budget endpoints via Postman.
