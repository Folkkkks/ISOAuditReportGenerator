# Validation of v1.0.0 Demo Day release

Executed offline in the supplied Linux environment:

- Python compileall: passed.
- Backend unit/API suite: 38 tests passed.
- Knowledge base, retrieval, prompt, language, metrics, review workflow, and PRD-alignment tests: passed.
- Evaluation dry-run: validated 10 input/Gold pairs without AI calls.
- Frontend logic and PDF integration suite: 12 tests passed.
- Frontend syntax check and Vite production build: passed.

User-executed Windows acceptance covered generation, saved-draft retrieval after refresh, auditor edits, change history, Markdown/PDF export, provider behavior, and a live prompt-injection case. The final provider-backed 10-case run using Gemini 3.5 Flash Lite and classification rubric v2 reached 1.0000 classification accuracy, 1.0000 macro F1, 1.0000 clause-pair accuracy, 1.0000 automated grounding, and zero released unsupported Major NC findings; see `reports/v1.0/`.

Backend review tests mock the AI provider where isolation is required. A finite Gold set and one live adversarial case do not prove universal accuracy or prompt-injection resistance. Gold reports remain `development_reviewed` until instructor or qualified-auditor sign-off.
