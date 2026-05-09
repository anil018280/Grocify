# Meeting – Advisor Meeting

**File Name:** 2026-03-03-advisor-meeting.md
**Meeting Type:** Advisor
**Date:** 2026-03-03
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
- GitHub repository structure created with `/backend`, `/ai`, `/meetings` folders.
- Database schema drafted: Users, Pantry, Recipes, Logs tables.
- FastAPI skeleton project initialized with `/health` and stub `/pantry` endpoints.
- Initial recipe dataset of 50 entries prepared in JSON format.
- YOLOv8 dataset requirements researched; COCO subset identified as viable starting point.

## 2) Accomplished During This Meeting
- Reviewed GitHub repo structure with advisor; structure approved.
- Presented database schema; advisor suggested adding a `created_at` / `updated_at` timestamp to all tables for traceability.
- Discussed RAG prototype plan: OpenAI embeddings + Chroma vector store.
- Advisor confirmed phased approach is appropriate: complete pantry backend before touching vision.
- Reminded team to keep evaluation metrics in mind from the start, not just at the end.
- Advisor asked for a demo of working endpoints by the next advisor meeting.

## 3) Issues / Blockers
- Recipe dataset lacks nutritional metadata; need to source or compute it.
- Chroma persistence across server restarts not yet tested.
- CORS configuration not yet set up for frontend integration.

## 4) Action Items
- Add `created_at` / `updated_at` timestamps to all schema tables | Owner: Anil | Due: 2026-03-07
- Complete RAG embedding pipeline with Chroma persistence | Owner: Harsha | Due: 2026-03-10
- Expand recipe dataset to 100 entries and add basic nutritional fields | Owner: Arathi | Due: 2026-03-10
- Set up CORS middleware and `.env` config in FastAPI | Owner: Sanjushree | Due: 2026-03-07

## 5) Plans / Goals for Next Meeting
- Demo working Pantry CRUD endpoints via Postman.
- Show basic RAG retrieval returning recipe results.
- Review dataset completeness.
