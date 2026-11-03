# Changelog — Lifeboard 0.10 (Vivid Focus)

1. **Brand**: new unified cactus silhouette with expressive eyes; no smile. Updated Vue mascot, public SVG and favicon.
2. **Design**: new vibrant theme layer `src/shared/styles/lifeboard-vibrant.css` for forest, dark and orange. Saturated greens, restrained lime highlight, fresh surfaces, new hover/focus contrast, and denser professional type.
3. **Weekly review mobile**: keeps detail editor and analytics as dialogs, but adds a meaningful signal / seven-day mini graph / focus goals / next step via reusable `ReviewPulse.vue`.
4. **Compatibility**: no changes to persisted `LifeState`, backup JSON, route names or frontend-only auth. Docker service remains `lifeboard` at `8080:80`.
5. **QA**: TypeScript script parse, CSS parse, SVG XML validation, import validation, zip integrity. Full Vite build requires local or Docker dependency installation.
