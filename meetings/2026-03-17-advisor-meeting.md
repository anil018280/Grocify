# Meeting – Advisor Meeting

**File Name:** 2026-03-17-advisor-meeting.md
**Meeting Type:** Advisor
**Date:** 2026-03-17
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
- Pantry CRUD (GET, POST, PUT, DELETE) fully implemented and tested via Postman.
- Post-retrieval ingredient-match filter added to RAG pipeline.
- Recipe dataset completed to 100 entries with full nutritional fields.
- API endpoint documentation added to README.

## 2) Accomplished During This Meeting
- Live demo of Pantry CRUD endpoints to advisor via Postman; all four operations confirmed working with PostgreSQL.
- Demonstrated RAG retrieval with ingredient-match filter: queried "eggs, spinach, onion" and received 3 ingredient-appropriate recipes.
- Advisor acknowledged solid backend progress.
- Discussed evaluation plan for RAG: advisor recommended using precision@k and recall@k with a small ground-truth query set (20–30 queries).
- Advisor suggested beginning React frontend scaffolding now to avoid a bottleneck later in the semester.
- Noted that Phase 2 (budget optimization) can begin in parallel once pantry backend is confirmed stable.

## 3) Issues / Blockers
- No formal RAG evaluation set defined yet.
- Frontend not yet started.
- JWT user authentication not yet implemented; endpoints are currently open.

## 4) Action Items
- Create 20-query RAG evaluation set with ground-truth recipe labels | Owner: Harsha | Due: 2026-03-24
- Initialize React project with routing structure and pantry list view (static) | Owner: Sanjushree | Due: 2026-03-24
- Implement JWT authentication (register, login, token validation) | Owner: Anil | Due: 2026-03-24
- Draft Phase 2 budget optimization spec (endpoints, data model) | Owner: Arathi | Due: 2026-03-24

## 5) Plans / Goals for Next Meeting
- Present RAG evaluation baseline results.
- Show React frontend scaffolding.
- Review auth implementation.
