# Meeting – Advisor Meeting

**File Name:** 2026-04-28-advisor-meeting.md
**Meeting Type:** Advisor
**Date:** 2026-04-28
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
- Usability fixes deployed: recipe suggestion tooltip added, budget price input redesigned to inline edit.
- RAG latency reduced to ~1.5s.
- Workbook 2 full draft assembled: System Design, Implementation, Evaluation, Future Work sections complete.
- Embedding pipeline diagram added to System Design.
- YOLOv8 offline demo results (8/10 items detected) documented as proof-of-concept section.

## 2) Accomplished During This Meeting
- Presented updated UI to advisor with usability fixes applied; advisor confirmed both changes improve the experience.
- Walked through Workbook 2 draft section by section; advisor feedback:
  - System Design: strong overall; add one sentence clarifying why Chroma was chosen over Pinecone (cost + operational simplicity for MVP).
  - Evaluation: clearly structured; add F1 score to the RAG metrics table alongside precision and recall.
  - Future Work: concrete and realistic; make sure to distinguish short-term (next semester) from long-term goals.
  - Vision section: well-scoped as proof-of-concept; no changes needed.
- Advisor reviewed GitHub repository; confirmed meeting notes, diagrams, and source code are well-organized.
- Advisor signed off on Workbook 2 as ready for final polish and submission.
- Discussed final presentation format: 15-minute slot, demo + slides, expect Q&A from advisor and peers.

## 3) Issues / Blockers
- Chroma vs Pinecone rationale sentence missing in System Design.
- F1 score not yet in RAG metrics table in Evaluation section.
- Presentation slide deck not yet started.

## 4) Action Items
- Add Chroma vs Pinecone rationale to System Design | Owner: Arathi | Due: 2026-04-30
- Add F1@3 to RAG metrics table in Evaluation section | Owner: Harsha | Due: 2026-04-30
- Full team proofread for terminology consistency | Owner: Entire Team | Due: 2026-05-01
- Begin presentation slide deck (problem → system → demo → evaluation → future work) | Owner: Sanjushree | Due: 2026-05-01

## 5) Plans / Goals for Next Meeting
- Workbook 2 finalized and submitted.
- Presentation slides drafted.
- Plan for CMPE 295B: vision pipeline, real-time pricing, mobile frontend.
