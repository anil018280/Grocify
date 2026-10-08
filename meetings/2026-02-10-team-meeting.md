Meeting 4 – Team-Only(dicussion about the techstack)

Meeting Type: Team-Only

Date: 2026-02-10

Start–End Time: 6:30 PM – 7:00 PM

Location/Mode: Zoom

Attendees:
- Anil Kumar Bandaru
- Harsha Vardhan Badithaboina
- Arathi Boddam
- Sanjushree Golla

1) Accomplished Since Last Meeting
- Abstract submitted (Feb 5).
- Presentation delivered (Feb 6).
- Initial high-level architecture defined.

2) Accomplished During This Meeting
- Discussed detailed technology stack options for each module:
  • Frontend: React vs Next.js (SSR benefits, deployment simplicity).
  • Backend: FastAPI vs Django REST (performance vs built-in features).
  • Database: PostgreSQL vs MongoDB (structured vs flexible schema).
  • AI Layer: OpenAI API vs open-source LLMs (cost, latency, API limits).
  • Vector Store: Chroma vs Pinecone (free tier availability, scalability).
  • Vision Model: YOLOv8 (self-hosted) vs Amazon Rekognition (managed service).
- Evaluated cost implications of paid APIs (LLM usage limits, vector DB storage, cloud deployment).
- Discussed whether to self-host models or rely on external APIs.
- Identified need to minimize paid dependencies for sustainability.

3) Issues / Blockers
- Uncertainty about API usage limits and pricing for LLM providers.
- Need to estimate dataset size for recipe storage.
- Decision required on cloud vs local deployment for development phase.

4) Action Items
- Research LLM pricing tiers and free limits | Owner: Harsha | Due: 2026-02-14
- Compare FastAPI vs Django implementation complexity | Owner: Anil | Due: 2026-02-14
- Research vector database free-tier constraints | Owner: Arathi | Due: 2026-02-14
- Explore YOLOv8 local setup feasibility | Owner: Sanjushree | Due: 2026-02-14

5) Plans / Goals for Next Meeting
- Finalize tech stack decisions.
- Decide on MVP feature boundaries.
- Begin database schema design.
