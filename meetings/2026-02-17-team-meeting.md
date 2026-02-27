Meeting 5 – Team-Only(Finalized TechStack)

Meeting Type: Team-Only

Date: 2026-02-17

Start–End Time: 7:00 PM – 8:30 PM

Location/Mode: Zoom

Attendees:
- Anil Kumar Bandaru
- Harsha Vardhan Badithaboina
- Arathi Boddam
- Sanjushree Golla

1) Accomplished Since Last Meeting
- Researched LLM pricing models and free-tier options.
- Compared backend frameworks and database systems.
- Evaluated feasibility of self-hosted vs cloud-based vision models.

2) Accomplished During This Meeting
- Finalized initial tech stack:
  • Frontend: React
  • Backend: FastAPI
  • Database: PostgreSQL
  • AI Layer: OpenAI API (initial phase) + RAG with Chroma
  • Vision: YOLOv8 (limited item categories for MVP)
- Defined MVP boundaries to avoid scope creep:
  • Pantry CRUD
  • Basic RAG-based recipe recommendation
  • Simple budget estimation
  • Limited vision detection (10–20 common items)
- Discussed system modularization to allow independent development.
- Decided to begin with database schema and backend API design.

3) Issues / Blockers
- Need curated recipe dataset.
- Uncertainty about training data for grocery item detection.
- Timeline planning required for phased implementation.

4) Action Items
- Draft database schema | Owner: Anil | Due: 2026-02-20
- Prepare small curated recipe dataset (JSON format) | Owner: Arathi | Due: 2026-02-22
- Set up basic FastAPI skeleton project | Owner: Harsha | Due: 2026-02-22
- Explore YOLOv8 dataset requirements and sample dataset | Owner: Sanjushree | Due: 2026-02-22

5) Plans / Goals for Next Meeting
- Review backend skeleton.
- Review initial dataset.
- Begin RAG prototype setup.
